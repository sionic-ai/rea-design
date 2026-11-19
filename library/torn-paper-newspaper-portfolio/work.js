// Work list — on entry the vertical nav strip slides in from the left over 1.4s expo.out and the shelf turns on 1s after .6s (IX2 Work – Load).
// When a book opens, jump straight to that book (original offset −122), and once fully open, re-measure the horizontal scroll length.
(() => {
  const nav = document.querySelector(".nav-inner");
  const page = document.querySelector(".page.content");
  const mm = gsap.matchMedia();
  mm.add("(min-width: 992px) and (prefers-reduced-motion: no-preference)", () => {
    gsap.fromTo(nav, { xPercent: -100 }, { xPercent: 0, duration: 1.4, ease: "expo.out" });
    gsap.fromTo(page, { opacity: 0 }, { opacity: 1, duration: 1, delay: 0.6, ease: "power1.out" });
  });
  document.addEventListener("fx:open", (e) => site.loco?.scrollTo(e.target, { offset: -122 }));
  document.addEventListener("fx:resize", () => site.loco?.update());

  // When scrolling stops, the spine under the cursor is re-picked as a hover — it unfolds like the original screen, then after moving on the background lights up on the next spine under the cursor
  // (locomotive scrolls via transform, so in this copy the browser doesn’t re-measure under the cursor)
  let px = -1, py = -1, still = 0;
  const pick = () => {
    const under = px < 0 ? null : document.elementFromPoint(px, py)?.closest(".brand-item");
    document.querySelectorAll(".brand-item.is-hover").forEach((n) => n !== under && n.classList.remove("is-hover"));
    under?.classList.add("is-hover");
  };
  addEventListener("pointermove", (e) => { px = e.clientX; py = e.clientY; pick(); }, { passive: true });
  let lastX = 0;
  site.loco?.on("scroll", (a) => {
    // Hit once at a nearly stopped frame (one and a half px below), and once more after it fully stops
    const x = a.scroll.x || a.scroll.y || 0;
    if (Math.abs(x - lastX) < 0.5) pick();
    lastX = x;
    clearTimeout(still);
    still = setTimeout(pick, 100);
  });
})();
