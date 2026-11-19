(() => {
  // A bent arrow (a horizontal line with its left end bent up + a right chevron) stretches from 1em → 3em on hover, redrawing the line — line dash 462·154 → 0,
  // viewBox 120×80 → 360×80, chevron +230 (.4s circ.inOut). On release returns to its own length in .3s circ.out. Arrow slot (data-fx-part="arrow") if empty, an image is inserted.
  const SVG = '<svg viewBox="0 0 120 80" width="20" aria-hidden="true" style="width:1em;height:auto;overflow:visible"><polyline data-fx-part="head" points="86 76 115 47 115 43 86 14" fill="none" stroke="currentColor" stroke-width="10" stroke-dasharray="86"/><polyline data-fx-part="line" points="115 45 6 45 6 1" fill="none" stroke="currentColor" stroke-width="10" stroke-dasharray="154"/></svg>';
  kfFx.register("elbow-arrow-stretch", (el, { options, reduce, hover }) => {
    const box = el.querySelector('[data-fx-part="arrow"]');
    if (!box) return;
    let made = false;
    if (!box.querySelector("svg")) { box.innerHTML = SVG; made = true; }
    const svg = box.querySelector("svg"), line = svg.querySelector('[data-fx-part="line"]'), head = svg.querySelector('[data-fx-part="head"]');
    if (!line || !head || reduce || !hover) return () => made && (box.innerHTML = "");
    const grow = +(options.grow ?? 3), dur = +(options.dur ?? 0.4), out = +(options.out ?? 0.3);
    const ease = kfFx.ease(options.ease || "circ.inOut", "circ.inOut"), outEase = kfFx.ease(options.outease || "circ.out", "circ.out");
    const long = 120 * grow, far = long - 15;
    let tl1, tl2;
    const on = () => {
      tl1 = gsap.timeline({ paused: true, defaults: { duration: dur, ease } });
      tl1.set(line, { strokeDasharray: 462, strokeDashoffset: 154 })
        .to(line, { strokeDasharray: 462, strokeDashoffset: 0 })
        .to(svg, { width: `${grow}em`, attr: { viewBox: `0 0 ${long} 80` } }, "<")
        .to(line, { attr: { points: `${far} 45 6 45 6 1` } }, "<")
        .to(head, { x: long - 120 - 10 }, "<");
      tl2 && (tl2.pause(), tl2.seek(1));
      tl1.play();
    };
    const off = () => {
      tl2 = gsap.timeline({ paused: true, defaults: { duration: out, ease: outEase } });
      tl2.to(svg, { width: "1em", attr: { viewBox: "0 0 120 80" } })
        .to(line, { strokeDasharray: 154, attr: { points: "115 45 6 45 6 1" } }, "<")
        .to(head, { x: 0 }, "<");
      tl1 && (tl1.pause(), tl1.seek(1));
      tl2.play();
    };
    el.addEventListener("pointerenter", on);
    el.addEventListener("pointerleave", off);
    return () => {
      el.removeEventListener("pointerenter", on);
      el.removeEventListener("pointerleave", off);
      tl1?.kill(); tl2?.kill();
      gsap.set([svg, line, head], { clearProps: "all" });
      if (made) box.innerHTML = "";
    };
  });
})();
