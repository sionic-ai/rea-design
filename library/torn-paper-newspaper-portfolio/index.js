// First page — four stacked testimonial cards fan out toward the hovered card (IX2 Review 1~4 IN·OUT values)
(() => {
  const mm = gsap.matchMedia();
  mm.add("(min-width: 992px) and (prefers-reduced-motion: no-preference)", () => {
    const cards = [...document.querySelectorAll(".aw-block")];
    if (cards.length !== 4) return;
    const rest = [0, -22, -43, -65];
    // Value measured from the original — the raised card stays in place and only the cards behind spread out (the second card also stays at −22vw)
    const spread = [[0, -1, -25, -50], [0, -22, -25, -50], [0, -22, -43, -45], rest];
    // Giving IX2 seconds (0.9~1.1s, background .5s) as is stops 7~11% earlier than the original measured under the same conditions — stretched by that much to match the original
    const stretch = 1.1;
    const inDur = [0.9, 1.1, 1.0, 0.95].map((d) => d * stretch);
    const outDur = [0.9, 0.95, 1.0, 1.1].map((d) => d * stretch);
    const bgDur = 0.54;
    // Card background is painted in js with expo.out like the original (IX2) — skin variables are read as computed colors and passed
    const rgb = (name) => { const s = document.createElement("i"); s.style.color = `var(${name})`; document.body.append(s); const v = getComputedStyle(s).color; s.remove(); return v; };
    const hot = rgb("--kf-raised"), calm = rgb("--kf-bg");
    const move = (xs, durs) => cards.forEach((c, i) => gsap.to(c, { x: `${xs[i]}vw`, duration: durs[i], ease: "expo.out", overwrite: "auto" }));
    gsap.set(cards, { x: (i) => `${rest[i]}vw` });
    const offs = cards.map((c, i) => {
      const on = () => { gsap.to(c, { backgroundColor: hot, duration: bgDur, ease: "expo.out", overwrite: "auto" }); move(spread[i], inDur); };
      const off = () => { gsap.to(c, { backgroundColor: calm, duration: bgDur, ease: "expo.out", overwrite: "auto" }); move(rest, outDur); };
      return site.hover(c, on, off);
    });
    return () => { offs.forEach((f) => f()); gsap.set(cards, { clearProps: "transform" }); };
  });
})();
