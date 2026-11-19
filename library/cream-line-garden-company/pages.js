(() => {
  const { lenis } = window.GG;
  document.querySelectorAll("[data-works]").forEach((g) => (g.innerHTML = window.GG.works(Number(g.dataset.works))));

  // Hero video cuts crossfade every 4 seconds (the original switches cuts within a single video)
  // Home service boards: divide the pinned range by the number of boards so only the current cell’s board is active (measured with the scroll event, as in the original).
  const svc = document.querySelector(".h-svc");
  if (svc) {
    const items = [...svc.querySelectorAll(".h-svc__item")];
    const onScroll = () => {
      const r = svc.getBoundingClientRect();
      const range = r.height - innerHeight;
      const p = Math.min(Math.max(-r.top / range, 0), 0.9999);
      const i = Math.floor(p * items.length);
      items.forEach((it, k) => it.classList.toggle("active", k === i));
    };
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // News row / About service row: swap the photo to that of the raised row
  const swap = (rows, attr, imgs, imgAttr) => rows.forEach((a) => a.addEventListener("mouseenter", () => {
    imgs.forEach((im) => im.classList.toggle("is-active", im.dataset[imgAttr] === a.dataset[attr]));
    rows.forEach((x) => x.classList.toggle("is-on", x === a));
  }));
  swap([...document.querySelectorAll("[data-news-target]")], "newsTarget", [...document.querySelectorAll("[data-news-image]")], "newsImage");
  swap([...document.querySelectorAll("[data-svc]")], "svc", [...document.querySelectorAll("[data-svc-img]")], "svcImg");

  // Column slider (original Splide 4.1.4 as is): panel width follows content · 40px gap (20px at 768 and below) · 1.2s transition, drag·inertia·end rubber band are left to Splide.
  // Progress bar = (current section + 1) ÷ (last section + 1)
  const colEl = document.querySelector("[data-top-column-slide]");
  if (colEl && window.Splide) {
    const col = new Splide(colEl, { arrows: false, type: "slide", pagination: false, gap: 40, speed: 1200, autoWidth: true, updateOnMove: true, breakpoints: { 768: { gap: 20 } } });
    const bar = colEl.querySelector(".splide__progress__bar");
    col.on("mounted move", () => { bar.style.width = `${100 * Math.min((col.index + 1) / (col.Components.Controller.getEnd() + 1), 1)}%`; });
    col.mount();
  }

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // About circle: the circle draws in 1s, the line in .3s, the text appears in 1.5s (once at 70% from the top)
    document.querySelectorAll("[data-what]").forEach((w) => {
      gsap.timeline({ scrollTrigger: { trigger: w, start: "top 70%", once: true } })
        .to(w.querySelectorAll(".path-circle"), { strokeDashoffset: 0, duration: 1, ease: "power1.inOut" })
        .to(w.querySelectorAll(".path-line"), { strokeDashoffset: 0, duration: 0.3, ease: "power1.inOut" })
        .to(w.querySelectorAll(".ab-what__desc, p"), { opacity: 1, duration: 1.5, ease: "power3.out" }, "+=0.3");
    });
  });
  mm.add("(prefers-reduced-motion: reduce)", () => {
    gsap.set(".path-circle, .path-line", { strokeDashoffset: 0 });
    gsap.set(".ab-what__desc, .ab-how__circles p", { opacity: 1 });
  });

  // Service horizontal flow (1024 and up): pin the panel group and move sideways by the vertical scroll amount (scrub 1)
  const inner = document.querySelector(".sv-h__inner");
  if (inner) mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
    const dist = () => inner.scrollWidth - innerWidth;
    gsap.to(inner, { x: () => -dist(), ease: "none", scrollTrigger: { trigger: ".sv-h__wrap", pin: true, scrub: 1, end: () => "+=" + dist(), invalidateOnRefresh: true } });
  });

  // Careers side table of contents: underline the cell being read, click to scroll smoothly to it
  document.querySelectorAll("[data-side]").forEach((a) => {
    const sec = document.getElementById(a.dataset.side);
    ScrollTrigger.create({ trigger: sec, start: "top 50%", end: "bottom 50%", onToggle: (s) => s.isActive && document.querySelectorAll("[data-side]").forEach((x) => x.classList.toggle("is-active", x === a)) });
    a.addEventListener("click", (e) => { e.preventDefault(); lenis ? lenis.scrollTo(sec, { offset: -90 }) : sec.scrollIntoView(); });
  });
})();
