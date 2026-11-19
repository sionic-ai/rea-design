// Work detail — player panel + next work (on touch devices it spreads open on scroll: top 75% → center center scrub, original --np-progress)
RW.page("project", (root) => {
  const off = window.RWPlayer(root);
  const next = root.querySelector(".next");
  let tw = null;
  if (next && matchMedia("(hover: none), (pointer: coarse)").matches) {
    tw = RW.reduce ? gsap.set(next, { "--np-progress": 1 }) : gsap.fromTo(next, { "--np-progress": 0 }, { "--np-progress": 1, ease: "none", scrollTrigger: { trigger: next.querySelector("a"), start: "top 75%", end: "center center", scrub: true } });
  }
  return () => { off(); tw?.scrollTrigger?.kill(); tw?.kill?.(); };
});
