// First page: stacked illustration swap (original initIllustrationMorph — four scrub ranges at section 0~20·20~40·40~60·60~80%) and the block drop-in of the big title section (power2.in, top bottom → center 40%).
// The art is our isometric slabs, pillars and bumps — not using the original paths, swapped in with the same ranges, curves and intervals.
(() => {
  const { reduce } = window.DB;
  gsap.registerPlugin(MorphSVGPlugin, DrawSVGPlugin);
  const NS = "http://www.w3.org/2000/svg";

  const stack = document.querySelector(".db-stack__track");
  const svg = document.querySelector(".db-iso");
  if (stack && svg) {
    const q = (k) => svg.querySelector(`[data-iso="${k}"]`);
    const top = q("top"), left = q("left"), right = q("right"), outline = q("outline"), cube = q("cube");
    const pillars = q("pillars"), studs = q("studs"), deco = q("deco");
    const decoLines = svg.querySelectorAll('[data-iso="deco-line"]'), decoDots = svg.querySelectorAll('[data-iso="deco-dot"]');
    // Five pillars — cylinders on the panel (side + cap)
    const P = [[95, 150], [235, 150], [165, 185], [165, 150], [165, 115]];
    P.forEach(([x, y], i) => {
      const g = document.createElementNS(NS, "g");
      g.setAttribute("data-pillar", i);
      g.innerHTML = `<path class="is-blue" d="M${x - 17} ${y} V${y - 60} A17 9 0 0 0 ${x + 17} ${y - 60} V${y} A17 9 0 0 1 ${x - 17} ${y} Z"/><ellipse class="is-cap" cx="${x}" cy="${y - 60}" rx="17" ry="9"/>`;
      pillars.appendChild(g);
    });
    // Twelve bumps — tap in turn, closest to the center first
    const S = [];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) S.push([100 + c * 43 + r * 22, 140 + r * 22 - c * 0 + c * 11]);
    S.sort((a, b) => Math.hypot(a[0] - 165, a[1] - 175) - Math.hypot(b[0] - 165, b[1] - 175)).forEach(([x, y]) => {
      const e = document.createElementNS(NS, "ellipse");
      e.setAttribute("cx", x); e.setAttribute("cy", y); e.setAttribute("rx", 11); e.setAttribute("ry", 6);
      studs.appendChild(e);
    });
    const studEls = [...studs.children], pillarEls = [...pillars.children];

    // The shape each of the plate’s three faces takes per segment
    const flat = { top: "M165 110 L300 180 L165 250 L30 180 Z", left: "M165 250 V264 L30 194 V180 Z", right: "M165 250 V264 L300 194 V180 Z" };
    const wide = { top: "M165 100 L320 180 L165 260 L10 180 Z", left: "M165 260 V272 L10 192 V180 Z", right: "M165 260 V272 L320 192 V180 Z" };
    const thin = { top: "M165 108 L320 188 L165 268 L10 188 Z", left: "M165 268 V272 L10 192 V188 Z", right: "M165 268 V272 L320 192 V188 Z" };

    gsap.set(pillarEls, { scaleY: 0, svgOrigin: "165 200", autoAlpha: 0 });
    gsap.set(outline, { drawSVG: "0%", autoAlpha: 0 });
    gsap.set(deco, { autoAlpha: 0 });
    gsap.set(decoLines, { drawSVG: "0%" });
    gsap.set(decoDots, { scale: 0, transformOrigin: "center center" });
    studEls.forEach((s) => gsap.set(s, { scale: 0, svgOrigin: `${s.getAttribute("cx")} ${s.getAttribute("cy")}` }));
    gsap.set(cube, { scale: 1, svgOrigin: "165 135" });

    if (!reduce) {
      const seg = (a, b, extra = {}) => gsap.timeline({ scrollTrigger: { trigger: stack, start: `${a}% top`, end: `${b}% top`, scrub: true, ...extra }, defaults: { ease: "none" } });
      // 0~20% — the tall block becomes a flat panel, the small cube above disappears
      const t1 = seg(0, 20);
      t1.to(top, { morphSVG: flat.top }, 0).to(left, { morphSVG: flat.left }, 0).to(right, { morphSVG: flat.right }, 0).to(cube, { scale: 0 }, 0);
      // 20 to 40% — five pillars rise (for .75 after .25) and the dotted border is drawn (.3 to .7)
      const t2 = seg(20, 40);
      t2.to(pillarEls, { autoAlpha: 1, duration: 0.01 }, 0.25).to(pillarEls, { scaleY: 1, duration: 0.75 }, 0.25)
        .to(outline, { autoAlpha: 1, duration: 0.01 }, 0.25).to(outline, { drawSVG: "100%", duration: 0.7 }, 0.3);
      // 40~60% — the column sinks into the panel (.35) and the border drops below 84.5, the panel widens (power2.out .5), decorative lines are drawn and the dot pops in (back.out(2))
      const t3 = seg(40, 60);
      t3.to(pillarEls, { scaleY: 0, duration: 0.35 }, 0.05).to(outline, { y: 84.5, autoAlpha: 0, duration: 0.35 }, 0.05)
        .to(top, { morphSVG: wide.top, duration: 0.5, ease: "power2.out" }, 0.1).to(left, { morphSVG: wide.left, duration: 0.5, ease: "power2.out" }, 0.1).to(right, { morphSVG: wide.right, duration: 0.5, ease: "power2.out" }, 0.1)
        .to(deco, { autoAlpha: 1, duration: 0.01 }, 0.5).to(decoLines, { drawSVG: "100%", duration: 0.3, stagger: 0.01 }, 0.5)
        .to(decoDots, { scale: 1, duration: 0.2, stagger: 0.02, ease: "back.out(2)" }, 0.6);
      // 60–80% — the pill thins and the decoration peels away (back.in(2)), bumps pop in from the center (back.out(1.5), .012 stagger), and the cube stands back up (back.out(1.7))
      const t4 = seg(60, 80);
      t4.to(top, { morphSVG: thin.top, duration: 0.4 }, 0).to(left, { morphSVG: thin.left, duration: 0.4 }, 0).to(right, { morphSVG: thin.right, duration: 0.4 }, 0)
        .to(deco, { y: 8 }, 0).to(decoLines, { drawSVG: "0%", duration: 0.3, stagger: 0.005 }, 0).to(decoDots, { scale: 0, duration: 0.2, stagger: 0.008, ease: "back.in(2)" }, 0)
        .to(studEls, { scale: 1, duration: 0.4, stagger: 0.012, ease: "back.out(1.5)" }, 0.1)
        .fromTo(cube, { y: 8 }, { scale: 1, y: 38, duration: 0.35, ease: "back.out(1.7)" }, 0.5);
    }
  }

  // Big title section — sinks by blue block 532 and black panel 187, and the seam shrinks along with it (power2.in)
  const who = document.querySelector(".db-who");
  if (who && !reduce) {
    const blue = who.querySelector('[data-who="blue"]'), black = who.querySelector('[data-who="black"]');
    const lines = [...who.querySelectorAll("[data-who-line]")].map((l) => ({ l, y1: +l.getAttribute("y1"), y2: +l.getAttribute("y2") }));
    const st = { p: 0 };
    gsap.to(st, {
      p: 1, ease: "power2.in",
      scrollTrigger: { trigger: who, start: "top bottom", end: "center 40%", scrub: true },
      onUpdate: () => {
        const e = st.p;
        blue.setAttribute("transform", `translate(0 ${532 * e})`);
        black.setAttribute("transform", `translate(0 ${187 * e})`);
        lines.forEach((d) => d.l.setAttribute("y1", d.y1 + (d.y2 - d.y1) * e));
      },
    });
  }

  window.DB.ready();
})();
