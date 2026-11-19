// Brand first page — the hero photo is picked by rotating through one of four per session (header text color per photo), starts resolving and turns the header on at 1.5s.
// The photo panel is pushed down at .5× scroll on desktop only (original js-parallax-element)
(() => {
  const NS = (window.NS = window.NS || { views: {} });
  const PICS = [
    ["Hero photo 1 · person working in a kitchen · natural window light · landscape 16:10", "dark"],
    ["Hero photo 2 · product on white cloth · soft morning light · landscape 16:10", "dark"],
    ["Hero photo 3 · in-store display shelves · warm lighting · 16:10 landscape", "dark"],
    ["Hero photo 4 · two figures on a hill · overcast sky · 16:10 landscape", "light"],
  ];
  // The first photo not yet shown this session — once all are shown, start over (original topIntroductionImageHistory)
  const pick = () => {
    const key = "ns-hero-history";
    let seen = [];
    try { seen = JSON.parse(sessionStorage.getItem(key) || "[]"); } catch {}
    if (seen.length >= PICS.length) seen = [];
    let n = 0;
    while (seen.includes(n)) n++;
    seen.push(n);
    try { sessionStorage.setItem(key, JSON.stringify(seen)); } catch {}
    return PICS[n];
  };
  const mobile = /android|iphone|ipad|ipod|mobile|tablet/i.test(navigator.userAgent);
  let io = null, onScroll = null, onDone = null;
  const choose = (hero) => {
    const [label, tone] = pick();
    hero.dataset.label = label;
    hero.dataset.tone = tone;
  };
  // On first open, choose before the parts are attached (this script runs before the document is fully read)
  const first = document.querySelector(".ns-hero");
  if (first) choose(first);

  NS.views.top = {
    init(c) {
      const html = document.documentElement;
      const hero = c.querySelector(".ns-hero");
      if (!hero) return;
      // When entering via Barba, parts are already attached under the names in the html — pick one, then detach and reattach.
      if (!hero.dataset.tone) {
        choose(hero);
        hero.removeAttribute("data-fx");
        requestAnimationFrame(() => hero.setAttribute("data-fx", "gl-unblur-intro"));
      }
      html.dataset.firstViewColor = hero.dataset.tone;
      onDone = () => html.classList.add("introduction-finished");
      hero.addEventListener("fx:done", onDone, { once: true });
      io = new IntersectionObserver((es) => es.forEach((e) => html.classList.toggle("is-intersecting-first-view", e.isIntersecting)), { rootMargin: "-10px 0px" });
      io.observe(hero);
      if (!mobile && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
        onScroll = () => requestAnimationFrame(() => {
          const cv = hero.querySelector(".fx-gu-canvas");
          if (cv) cv.style.transform = `translateY(${scrollY * 0.5}px)`;
        });
        addEventListener("scroll", onScroll, { passive: true });
      }
    },
    destroy() {
      const html = document.documentElement;
      io?.disconnect();
      if (onScroll) removeEventListener("scroll", onScroll);
      html.classList.remove("introduction-finished", "is-intersecting-first-view");
      delete html.dataset.firstViewColor;
      io = onScroll = null;
    },
  };
})();
