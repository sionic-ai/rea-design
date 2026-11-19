// Auto-advancing accordion: the 1px line above the open row fills from the left over 8s with no curve, and when full the next row opens (measured ≈8s in the original, after the last comes the first).
// Clicking a row opens it and the line refills from the start. Pauses when off screen.
(() => {
  const list = document.querySelector(".sv-acc__list");
  if (!list || !window.gsap) return;
  const items = [...list.children];
  const EACH = 8;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let cur = 0, tw = null;
  const open = (i) => {
    cur = (i + items.length) % items.length;
    items.forEach((li, k) => li.classList.toggle("is-open", k === cur));
    tw?.kill();
    items.forEach((li) => gsap.set(li.querySelector(".sv-acc__bar i"), { scaleX: 0 }));
    if (reduce) return;
    tw = gsap.to(items[cur].querySelector(".sv-acc__bar i"), { scaleX: 1, duration: EACH, ease: "none", onComplete: () => open(cur + 1) });
    if (!seen) tw.pause();
  };
  let seen = false;
  new IntersectionObserver(([e]) => { seen = e.isIntersecting; if (tw) seen ? tw.resume() : tw.pause(); }).observe(list);
  items.forEach((li, k) => li.querySelector("button").addEventListener("click", () => open(k)));
  open(0);
})();
