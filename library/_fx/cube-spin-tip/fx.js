(() => {
  kfFx.register("cube-spin-tip", (el, { options, reduce, scroller }) => {
    const faces = [...el.querySelectorAll(':scope > [data-fx-part="face"], :scope > .fx-cst__stage [data-fx-part="face"]')];
    if (!faces.length || !window.ScrollTrigger) return;
    const floor = el.querySelector('[data-fx-part="floor"]'), caption = el.querySelector('[data-fx-part="caption"]');
    const span = +options.span || 3000, fill = +(options.fill ?? 4);
    const stage = document.createElement("div"); stage.className = "fx-cst__stage";
    const box = document.createElement("div"); box.className = "fx-cst__box";
    faces.forEach((f) => box.appendChild(f)); if (floor) box.appendChild(floor);
    stage.appendChild(box); el.prepend(stage);
    const vw = () => innerWidth / 100;
    if (reduce) { gsap.set(box, { z: -20 * vw(), scale: 1 }); return () => { faces.forEach((f) => el.appendChild(f)); if (floor) el.appendChild(floor); stage.remove(); }; }
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.set(box, { z: -20 * vw(), scale: 0 });
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, scroller: scroller || undefined, start: "top top", end: `+=${span}`, scrub: 1, pin: true, invalidateOnRefresh: true } });
      tl.to(box, { scale: 1, duration: 1 }, 0);
      tl.to(box, { rotationY: 360, duration: 10, ease: "none" }, 1);
      if (caption && window.TextPlugin) faces.forEach((f, i) => tl.to(caption, { text: f.dataset.caption || "" }, [0, 2.5, 4.5, 6.5][i] ?? i * 2.5));
      if (caption && window.TextPlugin) tl.to(caption, { text: "" }, 9);
      tl.to(box, { rotationX: "+=89.9", duration: 1 }, 11);
      tl.to(box, { scale: fill, duration: 0.5 }, 12);
    });
    return () => { mm.revert(); faces.forEach((f) => el.appendChild(f)); if (floor) el.appendChild(floor); stage.remove(); };
  });
})();
