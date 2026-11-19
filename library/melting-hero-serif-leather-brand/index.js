// Pinned product intro sections — while the panel (height 300lvh × (section count − 1)) passes, the current section’s video is peeled away left to right (clip-path) revealing the next section, and
// When the remaining share exceeds 3/4, the next section title enters in 1s (Brand scrollSticky)
(() => {
  const box = document.querySelector("[data-coll]");
  if (!box || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const items = [...box.querySelectorAll(".j-coll__item")];
  const total = items.length;
  const paint = (p) => {
    const current = Math.min(Math.max(Math.floor(p * total), 0), total - 1);
    const progress = p * total - current;
    const next = Math.min(current + (progress > 0.75 ? 1 : 0), total - 1);
    items.forEach((it, n) => {
      it.style.setProperty("--progress", n < current ? 1 : n === current ? Math.min(progress, 1) : 0);
      const on = n === next;
      it.classList.toggle("is-active", on);
      it.querySelectorAll(".j-coll__head, .j-coll__txt, .j-coll__line, .j-coll__mark, .j-coll__num").forEach((c) => c.classList.toggle("is-on", on));
    });
  };
  paint(0);
  const mm = gsap.matchMedia();
  mm.add("(min-width: 960px)", () => {
    const st = ScrollTrigger.create({ trigger: box, start: "top top", end: () => `bottom+=${innerHeight * 3 - innerHeight * 1.6}px top`, invalidateOnRefresh: true, onUpdate: (s) => paint(s.progress) });
    return () => st.kill();
  });
})();

// Hero second sentence panel — like the original lastText, the whole panel also turns on at 10~70% of panel progress (lighting text one line at a time is the blur window in shared.js)
(() => {
  const box = document.querySelector(".j-fv__msg.is-last");
  if (!box) return;
  if (!window.gsap || !window.ScrollTrigger || matchMedia("(prefers-reduced-motion: reduce)").matches) return box.classList.add("is-show");
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.create({ trigger: box, start: "top bottom", end: "bottom top", scrub: 1, invalidateOnRefresh: true, onUpdate: (st) => box.classList.toggle("is-show", st.progress > 0.1 && st.progress <= 0.7) });
})();
