// First page — the motion of the original top/js/index.js with the same values: history section sequential color fill, section-end photo saturation, photo cluster sequential reveal, pinned horizontal flow for reading, phone photo swipe (slick)
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Origin — when a section overlaps the screen, every i × 700ms the i-th text sheds its gray and the photo sheds grayscale and 150% brightness (1s)
  const concept = document.querySelector(".mt-concept");
  let colored = false;
  const colorize = () => {
    if (colored || !concept) return;
    const r = concept.getBoundingClientRect();
    if (!(r.top < innerHeight && r.bottom > 0)) return;
    colored = true;
    for (let i = 1; i <= 5; i++) {
      setTimeout(() => {
        concept.querySelectorAll(`[data-step="${i}"]`).forEach((el) => el.classList.remove("is-gray", "is-filter"));
      }, reduce ? 0 : i * 700);
    }
  };

  // Photo group — when the top edge of any one in the group comes 500px above the bottom of the screen, the group turns on at i × 500ms intervals (.8s).
  const groups = ["1", "sp", "2"].map((k) => [...document.querySelectorAll(`[data-op="${k}"]`)]);
  const reveal = () => groups.forEach((g) => {
    if (!g.length || g.started) return;
    if (g.some((el) => el.getBoundingClientRect().top + 0 < innerHeight - 500 && el.offsetParent !== null)) {
      g.started = true;
      g.forEach((el, i) => setTimeout(() => el.classList.add("is-on"), reduce ? 0 : i * 500));
    }
  });
  const onScroll = () => { colorize(); reveal(); };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Full-bleed photo at the section end — restores saturation once half visible
  const last = document.querySelector(".is-filter2");
  if (last) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-saturate"); io.unobserve(e.target); } }), { threshold: 0.5 });
    io.observe(last);
  }

  // Reading material — only past 800px. Strip width = Card count × 30%, card width = 50/card count %, each card xPercent −500 × (count − 1).
  // Original curve name "easeInOut" is not a name in GSAP, so it falls back to the default curve — keep the same name as it is
  gsap.registerPlugin(ScrollTrigger);
  let made = [];
  const initBlog = () => {
    made.forEach((t) => t.kill()); made = [];
    const area = document.querySelector(".mt-blog"), wrap = document.querySelector(".mt-blog__area"), items = document.querySelectorAll(".mt-blog__item");
    gsap.set([wrap, items], { clearProps: "width" });
    if (innerWidth <= 800 || reduce || !area) return;
    const num = items.length;
    gsap.set(wrap, { width: num * 30 + "%" });
    gsap.set(items, { width: 50 / num + "%" });
    const tw = gsap.to(items, { xPercent: -500 * (num - 1), ease: "easeInOut", scrollTrigger: { trigger: area, start: "center center", end: "+=1500", pin: true, scrub: true } });
    made.push(tw.scrollTrigger, tw);
  };
  addEventListener("load", () => { initBlog(); ScrollTrigger.refresh(); });
  let lastW = innerWidth;
  addEventListener("resize", () => { if (innerWidth === lastW) return; lastW = innerWidth; initBlog(); });

  // Phone — origin photo slider (slick, 1.1 slides visible, no arrows)
  if (window.jQuery && jQuery.fn.slick) {
    jQuery(".mt-concept__slick").slick({ slidesToShow: 1.1, swipe: true, draggable: true, arrows: false, pauseOnFocus: true, pauseOnHover: true, infinite: true });
  }
})();
