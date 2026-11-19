// DJ media: when a photo cell reaches 80% of the screen, 9 cells grow from their corners in five diagonal groups ([0] [1,3] [2,4,6] [5,7] [8])
// (.5s power2.out, group .125s · within group .1s, reversed on scrolling back up). Video plays when 15% visible and pauses on exit — a video paused by the user is not played again.
(() => {
  const CELLS = ["polygon(0% 0%, 33.5% 0%, 33.5% 33%, 0% 33.5%)", "polygon(33% 0%, 66.5% 0%, 66.5% 33%, 33% 33.5%)", "polygon(66% 0%, 100% 0%, 100% 33%, 66% 33.5%)",
    "polygon(0% 33%, 33.5% 33%, 33.5% 66%, 0% 66.5%)", "polygon(33% 33%, 66.5% 33%, 66.5% 66%, 33% 66.5%)", "polygon(66% 33%, 100% 33%, 100% 66%, 66% 66.5%)",
    "polygon(0% 66%, 33.5% 66%, 33.5% 100%, 0% 100%)", "polygon(33% 66%, 66.5% 66%, 66.5% 100%, 33% 100%)", "polygon(66% 66%, 100% 66%, 100% 100%, 66% 100%)"];
  const GROUPS = [[0], [1, 3], [2, 4, 6], [5, 7], [8]];

  // The same photo set in every cell — when all are open, nine sets overlap and read as one
  document.querySelectorAll(".yf-reveal:not([data-video])").forEach((frame) => {
    const src = frame.querySelector(":scope > .wf-img");
    frame.querySelectorAll(".yf-reveal__mask").forEach((m) => m.append(src.cloneNode(true)));
  });

  const videos = [...document.querySelectorAll(".yf-reveal[data-video] video")];
  const held = new WeakSet();
  videos.forEach((v) => {
    v.addEventListener("pause", () => v.dataset.auto !== "pause" && held.add(v));
    v.addEventListener("play", () => held.delete(v));
  });
  const io = new IntersectionObserver((entries) => entries.forEach(({ target: v, isIntersecting }) => {
    if (isIntersecting) { if (!held.has(v)) { v.dataset.auto = ""; v.play().catch(() => {}); } }
    else if (!v.paused) { v.dataset.auto = "pause"; v.pause(); }
  }), { threshold: 0.15 });
  videos.forEach((v) => io.observe(v));

  window.yf.scene((mm) => {
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.utils.toArray(".yf-reveal:not([data-video])").forEach((frame) => {
        const masks = frame.querySelectorAll(".yf-reveal__mask");
        const tl = gsap.timeline({ scrollTrigger: { trigger: frame, start: "top 80%", toggleActions: "play none none reverse" } });
        GROUPS.forEach((g, o) => tl.to(g.map((i) => masks[i]), { clipPath: (k) => CELLS[g[k]], duration: 0.5, ease: "power2.out", stagger: 0.1 }, 0.125 * o));
      });
    });
  });
})();
