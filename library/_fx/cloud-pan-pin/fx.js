// Horizontal flight seen from above: pin the section to the screen and move the wide strip (aerial photo) across horizontally over (strip width − screen width) × 2 of scroll.
// Cloud layers each push left further (−10 · −20 · −30%) for a sense of height, and title letters blur out and scatter in turn at progress .3 by .04 (reference site horizontal section)
(() => {
  const split = (node) => {
    if (window.SplitText) return new SplitText(node, { type: "words,chars" }).chars;
    const out = [], text = node.textContent;
    node.textContent = "";
    text.split(/(\s+)/).forEach((w) => {
      if (/^\s+$/.test(w)) { node.append(w); return; }
      const word = document.createElement("span");
      word.style.display = "inline-block";
      [...w].forEach((ch) => { const c = document.createElement("span"); c.style.display = "inline-block"; c.textContent = ch; word.append(c); out.push(c); });
      node.append(word);
    });
    return out;
  };
  kfFx.register("cloud-pan-pin", (el, { options, reduce, scroller }) => {
    const track = el.querySelector('[data-fx-part="track"]');
    if (!track) return;
    const layers = [...el.querySelectorAll('[data-fx-part="layer"]')];
    const drifts = [...el.querySelectorAll('[data-fx-part="drift"]')];
    const title = el.querySelector('[data-fx-part="title"]');
    const curtains = [...el.querySelectorAll('[data-fx-part="curtain"]')];
    const text = title?.textContent;
    const range = () => (matchMedia("(max-width: 600px)").matches ? [0.22, 0.78] : matchMedia("(max-width: 1120px)").matches ? [0.15, 0.85] : [0, 1]);
    const span = () => Math.max(0, track.scrollWidth - innerWidth);
    const at = (k) => -span() * k;
    const sizeLayers = () => layers.forEach((l) => (l.style.width = `${track.scrollWidth}px`));
    sizeLayers();
    if (reduce) { gsap.set([track, ...layers], { x: () => at(range()[0]) }); return () => gsap.set([track, ...layers], { clearProps: "transform" }); }
    gsap.registerPlugin(ScrollTrigger);
    const ease = kfFx.ease(options.ease || "power1.inOut", "power1.inOut");
    const chars = title ? split(title) : [];
    const ctx = gsap.context(() => {
      if (curtains.length) gsap.to(curtains, { width: "0%", ease, duration: +(options.open ?? 1), scrollTrigger: { scroller, trigger: el, start: "top 70%" } });
      if (chars.length) {
        gsap.set(chars, { opacity: 0, y: "15%", filter: "blur(10px)" });
        gsap.to(chars, { opacity: 1, y: "0%", filter: "blur(0px)", duration: 0.6, stagger: 0.04, ease: "power1.out", scrollTrigger: { scroller, trigger: el, start: "top 80%" } });
      }
      const tl = gsap.timeline({
        scrollTrigger: {
          scroller, trigger: el, start: "top top", end: () => `+=${+(options.ratio ?? 2) * span()}`,
          scrub: true, pin: true, invalidateOnRefresh: true, onRefresh: sizeLayers,
        },
      });
      tl.fromTo([track, ...layers], { x: () => at(range()[0]) }, { x: () => at(range()[1]), ease, duration: 1 }, 0);
      drifts.forEach((d) => tl.to(d, { left: `-=${Math.abs(+(d.dataset.shift ?? 10))}%`, ease, duration: 1 }, 0));
      if (title) tl.to(title, { left: "-=10%", ease, duration: 1 }, 0);
      if (chars.length) tl.to(chars, { opacity: 0, scale: 0.7, filter: "blur(10px)", stagger: 0.04, ease, duration: 0.4 }, +(options.fade ?? 0.3));
    }, el);
    const img = track.tagName === "IMG" ? track : null;
    const onLoad = () => { sizeLayers(); ScrollTrigger.refresh(); };
    img?.addEventListener("load", onLoad, { once: true });
    const ro = new ResizeObserver(() => { sizeLayers(); });
    ro.observe(track);
    return () => { ro.disconnect(); img?.removeEventListener("load", onLoad); ctx.revert(); if (title && text != null) title.textContent = text; layers.forEach((l) => (l.style.width = "")); };
  });
})();
