(() => {
  const pair = (s, d) => {
    const v = String(s ?? d).split(",").map(Number);
    return v.length > 1 ? v : [v[0], v[0]];
  };
  // Pieces inside SVG (g·path) are written to the transform attribute by GSAP — like the original (framer), write to style transform (transform-box: fill-box) instead
  // Axis % is relative to the piece’s own box, and meets the style-inspecting tool and the writing-side css at the same place
  const inSvg = (n) => n instanceof SVGElement && !!n.ownerSVGElement;
  const prop = (n, origin) => {
    if (!inSvg(n)) return null;
    n.style.transformBox = "fill-box";
    n.style.transformOrigin = origin;
    const s = { x: 0, y: 0, rotation: 0, scale: 1 };
    const put = () => { n.style.transform = `translate(${s.x}px, ${s.y}px) rotate(${s.rotation}deg) scale(${s.scale})`; };
    return { s, put };
  };
  const tween = (n, from, to, origin) => {
    const p = prop(n, origin);
    if (!p) return gsap.fromTo(n, { ...from, transformOrigin: origin }, to);
    const { autoAlpha: a0, ...f } = from, { autoAlpha: a1, ...t } = to;
    if (a0 != null) gsap.set(n, { autoAlpha: a0 });
    Object.assign(p.s, f);
    p.put();
    const tl = gsap.timeline({ delay: t.delay || 0, repeat: t.repeat || 0, yoyo: !!t.yoyo });
    tl.to(p.s, { ...t, delay: 0, repeat: 0, yoyo: false, onUpdate: p.put }, 0);
    if (a1 != null) tl.to(n, { autoAlpha: a1, duration: t.duration, ease: t.ease }, 0);
    return tl;
  };

  kfFx.register("spin-pop-bob", (el, { options, reduce }) => {
    const bob = el.querySelector('[data-fx-part="bob"]');
    const glyphs = [...el.querySelectorAll('[data-fx-part="glyph"]')];
    if (reduce) return () => {};

    const swing = kfFx.ease(options.swing || "0.42,0,0.58,1", "sine.inOut");
    const tweens = [];

    // Entrance — the original (Brand) shrinks size · push · tilt on one curve, and with the pivot set low (50% 80%) it looks as if it bounces up tail first
    const fade = options.fade === "true";
    tweens.push(tween(el,
      { scale: +(options.scale ?? 0), y: +(options.y ?? 80), rotation: +(options.rotate ?? -50), ...(fade ? { autoAlpha: 0 } : {}) },
      { scale: 1, y: +(options.to ?? 0), rotation: 0, ...(fade ? { autoAlpha: 1 } : {}), duration: +(options.dur ?? 1.2), ease: kfFx.ease(options.ease || "0.19,1,0.22,1", "expo.out"), delay: +(options.delay ?? 0) },
      options.origin || "50% 80%"));

    // Floating — runs from the start, separate from the entrance (in the original too, the inner art is already wobbling while the outer plane bounces). With no children, applies to the element’s translate · rotate properties so it doesn’t overlap the entrance transform
    const bv = String(options.bob ?? "15").split(",").map(Number);
    const [y0, y1] = bv.length > 1 ? bv : [bv[0], 0];
    const [r0, r1] = pair(options.tilt, "0");
    if (y0 !== y1 || r0 !== r1) {
      const loop = { duration: +(options.period || 2), ease: swing, repeat: -1, yoyo: true, delay: +(options["bob-delay"] ?? 0) };
      if (bob) {
        tweens.push(tween(bob, { y: y0, rotation: r0 }, { y: y1, rotation: r1, ...loop }, "50% 50%"));
      } else {
        const p = { y: y0, r: r0 };
        const put = () => { el.style.translate = `0 ${p.y.toFixed(2)}px`; el.style.rotate = `${p.r.toFixed(2)}deg`; };
        put();
        tweens.push(gsap.to(p, { y: y1, r: r1, ...loop, onUpdate: put }));
      }
    }

    // Pieces inside the picture (petals·hearts·hands) pass through the value list evenly. data-keys ”a,b,…” · data-prop rotate|scale|y · data-period · data-wait · data-yoyo false repeats from the start
    for (const g of glyphs) {
      const keys = String(g.dataset.keys || "").split(",").map(Number).filter((n) => !Number.isNaN(n));
      if (keys.length < 2) continue;
      const key = { rotate: "rotation", scale: "scale", y: "y" }[g.dataset.prop || "rotate"] || "rotation";
      const origin = g.dataset.origin || "50% 50%";
      const p = prop(g, origin);
      const target = p ? p.s : g;
      if (p) { p.s[key] = keys[0]; p.put(); } else gsap.set(g, { [key]: keys[0], transformOrigin: origin });
      tweens.push(gsap.to(target, {
        keyframes: { [key]: keys, easeEach: swing },
        duration: +(g.dataset.period || 3), repeat: -1, yoyo: g.dataset.yoyo !== "false", delay: +(g.dataset.wait || 0), ease: "none",
        ...(p ? { onUpdate: p.put } : {}),
      }));
    }

    return () => {
      tweens.forEach((t) => t.kill());
      const all = [el, bob, ...glyphs].filter(Boolean);
      gsap.set(all, { clearProps: "transform,opacity,visibility" });
      all.forEach((n) => { n.style.removeProperty("transform-box"); n.style.removeProperty("transform-origin"); n.style.removeProperty("transform"); });
      el.style.removeProperty("translate");
      el.style.removeProperty("rotate");
    };
  });
})();
