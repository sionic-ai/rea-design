// Shop loader — small photos go .1 → 1 (.5s power2.in) at .3s intervals, and .5s after all are solid the curtain lifts in .3s power2.out and the products appear.
// Phones don’t scatter — the whole 2-column grid panel appears from .3s at .2s intervals over 1.25s power3.inOut (original ShopGrid).
(() => {
  const loader = document.querySelector(".cd-shop-loader");
  const shop = document.querySelector(".cd-shop");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const done = () => {
    shop?.dispatchEvent(new CustomEvent("fx:ready"));
    if (shop && innerWidth < 768) gsap.fromTo(shop, { opacity: 0 }, { opacity: 1, duration: reduce ? 0 : 1.25, delay: reduce ? 0 : 0.3, ease: "power3.inOut" });
  };
  if (!loader || reduce) { loader?.remove(); done(); return; }
  const tl = gsap.timeline();
  loader.querySelectorAll("i").forEach((d) => tl.fromTo(d, { opacity: 0.1 }, { opacity: 1, duration: 0.5, ease: "power2.in" }, "<0.3"));
  tl.to({}, { duration: 0.5, onComplete: () => { done(); gsap.to(loader, { opacity: 0, duration: 0.3, ease: "power2.out", onComplete: () => loader.remove() }); } });
})();
