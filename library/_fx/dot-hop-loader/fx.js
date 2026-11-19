(() => {
  // Logo loader — the dot of the logo in the middle of the curtain bounces twice (hop up .5s circ.out · in place .2s circ.in · once more a bit lower), rests .18s, then the scattered letters gather
  // (gathering 1.8s power4.out, faded letters appear .25s later over 1s circ.out), and when done the logo flies to the head spot (to) in .8s power4.out and the curtain lifts away at .9s
  kfFx.register("dot-hop-loader", (el, { options, reduce }) => {
    const q = (r) => [...el.querySelectorAll(`[data-fx-part="${r}"]`)];
    const dot = q("dot")[0], gather = q("gather"), fade = q("fade"), mark = q("mark")[0];
    const done = () => el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true }));
    if (reduce) { gsap.set(el, { display: "none" }); done(); return; }
    const hop = +(options.hop ?? 20), up = +(options.up ?? 0.5), down = +(options.down ?? 0.2), gap = +(options.gap ?? 0.18);
    const meet = +(options.meet ?? 1.8), show = +(options.show ?? 1), out = +(options.out ?? 0.9), fly = +(options.fly ?? 0.8);
    const xOf = (n, d) => +(n.getAttribute("data-x") ?? d);
    if (gather.length) gsap.set(gather, { x: (i, n) => xOf(n, 0) });
    if (fade.length) gsap.set(fade, { x: (i, n) => xOf(n, 60), opacity: 0 });
    const tl = gsap.timeline({ delay: +(options.delay ?? 0) });
    if (dot) tl.to(dot, { y: -hop, duration: up, ease: "circ.out" }).to(dot, { y: 0, duration: down, ease: "circ.in" })
      .to(dot, { y: -hop * 0.9, duration: up, ease: "circ.out" }).to(dot, { y: 0, duration: down, ease: "circ.in" });
    if (gather.length) tl.to(gather, { x: 0, duration: meet, ease: "power4.out" }, "+=" + gap);
    if (fade.length) tl.to(fade, { x: 0, opacity: 1, duration: show, ease: "circ.out" }, gather.length ? "<+=0.25" : ">");
    tl.call(() => {
      const dest = options.to && document.querySelector(options.to);
      if (mark && dest) {
        const a = dest.getBoundingClientRect(), r = mark.getBoundingClientRect();
        gsap.to(mark, { x: a.left - r.left, y: a.top - r.top, scale: a.width / (r.width || 1), transformOrigin: "0 0", duration: fly, ease: "power4.out" });
      }
      gsap.to(el, { height: "0%", duration: out, ease: "power4.out", onComplete: done });
    });
    return () => { tl.kill(); gsap.killTweensOf([el, mark, dot, ...gather, ...fade].filter(Boolean)); gsap.set([el, mark, dot, ...gather, ...fade].filter(Boolean), { clearProps: "all" }); };
  });
})();
