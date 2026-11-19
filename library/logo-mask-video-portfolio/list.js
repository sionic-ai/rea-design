// Work list — cards are revealed with .4s power1.out when visible (original: loads the first video scene ahead and only switches on late arrivals at .4s)
RW.page("works", (root) => {
  const { $$, reduce } = RW;
  if (reduce) return;
  const tw = $$(".pcard", root).map((c) => gsap.from(c, { opacity: 0, duration: 0.4, ease: "power1.out", scrollTrigger: { trigger: c, start: "top 95%" } }));
  return () => tw.forEach((t) => { t.scrollTrigger?.kill(); t.kill(); });
});
