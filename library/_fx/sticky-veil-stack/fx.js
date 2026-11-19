(() => {
  // All the while the next panel rises from the bottom of the screen, the previous panel’s image shrinks 1.05→1 (no curve), and once the next panel’s top edge passes 33% of the screen the background-color veil over the previous panel darkens
  kfFx.register("sticky-veil-stack", (el, { options, reduce, scroller }) => {
    if (!window.gsap || !window.ScrollTrigger) return;
    const frames = [...el.querySelectorAll('[data-fx-part="frame"]')];
    if (frames.length < 2) return;
    const zoom = +(options.zoom ?? 1.05), veilAt = options.veil || "top 33%";
    const made = [], tws = [];
    frames.forEach((f, i) => {
      const next = frames[i + 1];
      if (!next) return;
      let veil = f.querySelector('[data-fx-part="veil"]');
      if (!veil) { veil = document.createElement("span"); veil.className = "fx-svs-veil"; f.appendChild(veil); made.push(veil); }
      if (reduce) return;
      const media = f.querySelector('[data-fx-part="media"]');
      if (media) tws.push(gsap.fromTo(media, { scale: zoom }, { scale: 1, ease: "none", scrollTrigger: { trigger: next, scroller, start: "top bottom", end: "top top", scrub: true } }));
      tws.push(gsap.fromTo(veil, { opacity: 0 }, { opacity: 1, ease: "none", scrollTrigger: { trigger: next, scroller, start: veilAt, end: "top top", scrub: true } }));
    });
    return () => { tws.forEach((t) => { t.scrollTrigger?.kill(); t.revert(); }); made.forEach((v) => v.remove()); };
  });
})();
