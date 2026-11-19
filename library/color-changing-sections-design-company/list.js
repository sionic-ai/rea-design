// Work list — original ElementsCategoryEntries values: the clip opens over .35s power2.out from the side the pointer entered (the nearer of top, bottom, center), and
// The one opened earlier closes toward the opposite side in .35s, and on leaving it closes toward the exit side in .6s. The photo group follows the mouse height by .1 each frame (.1s power2.out).
(() => {
  const reduce = window.ss?.reduce;
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const OPEN = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";
  const TOP = "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)";
  const BOTTOM = "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)";

  window.ssAnimHead?.();

  // Narrow-screen list: when a row enters the screen it gets in-view (original cases-list-mobile)
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in-view"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -5% 0px" });
  $$(".ss-cases-item").forEach((li) => io.observe(li));

  const wrap = document.querySelector(".ss-entries-inner");
  const medias = document.querySelector(".ss-medias");
  if (!wrap || !medias || !window.gsap || matchMedia("(max-width: 899px)").matches) return;
  const items = $$(".ss-cases-item", wrap);
  const cards = $$(".case-item", medias);
  gsap.set(cards, { clipPath: TOP });
  const side = (e, el) => {
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    const dTop = (x - r.width / 2) ** 2 + y ** 2, dBot = (x - r.width / 2) ** 2 + (y - r.height) ** 2;
    return dTop <= dBot ? "top" : "bottom";
  };
  let current = null;
  items.forEach((li, i) => {
    li.addEventListener("mouseenter", (e) => {
      const card = cards[i], dir = side(e, li);
      const prev = current !== null && current !== i ? cards[current] : null;
      current = i;
      gsap.killTweensOf(card);
      if (prev) { gsap.killTweensOf(prev); gsap.set(prev, { zIndex: 1 }); }
      gsap.set(card, { zIndex: 2 });
      if (gsap.getProperty(card, "clipPath") !== OPEN) gsap.set(card, { clipPath: dir === "top" ? TOP : BOTTOM });
      gsap.to(card, { clipPath: OPEN, duration: reduce ? 0 : 0.35, ease: "power2.out" });
      if (prev) gsap.to(prev, { clipPath: dir === "top" ? BOTTOM : TOP, duration: reduce ? 0 : 0.35, ease: "power2.out", onComplete: () => gsap.set(prev, { zIndex: 0 }) });
    });
    li.addEventListener("mouseleave", (e) => {
      gsap.to(cards[i], { clipPath: side(e, li) === "top" ? TOP : BOTTOM, duration: reduce ? 0 : 0.6, ease: "power2.out" });
    });
  });
  let aim = 0, y = 0, lastClient = 0;
  wrap.addEventListener("mousemove", (e) => { lastClient = e.clientY; aim = e.clientY - wrap.getBoundingClientRect().top; });
  addEventListener("scroll", () => { if (lastClient) aim = lastClient - wrap.getBoundingClientRect().top; }, { passive: true });
  const follow = () => {
    y += (aim - y) * 0.1;
    const max = wrap.offsetHeight - (cards[0]?.offsetHeight || 0);
    gsap.to(medias, { y: Math.max(0, Math.min(y, max)), duration: 0.1, ease: "power2.out", overwrite: true });
    requestAnimationFrame(follow);
  };
  requestAnimationFrame(follow);
})();
