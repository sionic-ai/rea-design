(() => {
  // Vertically lined-up cards each stick (sticky) at the same height. While a card rises from 75% of the screen to its sticking spot, it fans out into its own fan position (tilt · x · y)
  // Moves along bound to scroll (power1.in), the moment it attaches it spreads sideways, squashes vertically, then bounces back with elastic
  const list = (v, fb) => (v ? String(v).split(",").map((s) => s.trim()).filter(Boolean) : fb);
  kfFx.register("sticky-fan-squash", (el, { options, reduce, scroller }) => {
    const cards = [...el.querySelectorAll('[data-fx-part="card"]')];
    if (!cards.length) return;
    gsap.registerPlugin(ScrollTrigger);
    const faces = cards.map((c) => c.querySelector('[data-fx-part="face"]') || c);
    if (reduce) return;
    const pick = (key, fb) => {
      const narrow = matchMedia("(max-width: 767px)").matches, mid = matchMedia("(max-width: 991px)").matches;
      return list(narrow ? options[`${key}-narrow`] : mid ? options[`${key}-mid`] : null, null) || list(options[key], fb);
    };
    const bounce = +(options.bounce ?? 1), squash = +(options.squash ?? 1.5);
    const ease = kfFx.ease(options.ease || "power1.in", "power1.in");
    const mm = gsap.matchMedia();
    mm.add({ narrow: "(max-width: 767px)", mid: "(min-width: 768px) and (max-width: 991px)", wide: "(min-width: 992px)" }, () => {
      const rot = pick("rotate", ["0", "4", "-4"]).map(Number), xs = pick("x", ["0em"]), ys = pick("y", ["0em"]);
      const top = parseFloat(getComputedStyle(cards[0]).top) || 0;
      cards.forEach((card, i) => {
        const face = faces[i];
        gsap.set(face, { rotate: 0, x: 0, y: 0, scale: 1 });
        gsap.to(face, {
          rotate: rot[i % rot.length], x: xs[i % xs.length], y: ys[i % ys.length], ease,
          scrollTrigger: { trigger: card, ...(scroller && { scroller }), start: options.start || "top 75%", end: `top-=${top} top`, scrub: true },
        });
        ScrollTrigger.create({
          trigger: card, ...(scroller && { scroller }), start: `top-=${top} top`,
          onEnter: () => {
            const w = face.offsetWidth, h = face.offsetHeight, s = squash * parseFloat(getComputedStyle(face).fontSize);
            gsap.timeline()
              .to(face, { scaleX: (w + s) / w, scaleY: (h - 0.33 * s) / h, duration: 0.1, ease: "power1.out" })
              .to(face, { scaleX: 1, scaleY: 1, duration: bounce, ease: options["bounce-ease"] || "elastic.out(1, 0.3)" });
          },
        });
      });
    });
    return () => { mm.revert(); gsap.set(faces, { clearProps: "transform" }); };
  });
})();
