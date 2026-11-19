// Team detail — pin the paper-colored section to the screen edge and slide the strip horizontally. Meanwhile the left and right vertical strip text moves down by the same number of pixels.
// Makes the frame look stopped in the pinned span (original --wrapper-txt-y). The growth card unfolds at 50% of screen.
(() => {
  (window.opPages = window.opPages || {}).detail = (main, { reduce, PC }) => {
    const root = document.documentElement, wrap = document.getElementById("op-wrap");
    const mm = gsap.matchMedia();
    const body = main.querySelector("[data-pinbody]"), cont = main.querySelector("[data-pincont]");
    mm.add(PC, () => {
      const dist = () => cont.clientWidth - body.clientWidth;
      gsap.to(cont, {
        x: () => -dist(), ease: "none",
        scrollTrigger: {
          trigger: main.querySelector("[data-pinscroll]"), start: () => "100% bottom", end: () => "+=" + dist(),
          scrub: true, pin: true, invalidateOnRefresh: true,
          onToggle: () => {
            if (root.classList.contains("is-pinned")) root.classList.remove("is-pinned");
            else { root.classList.add("is-pinned"); gsap.set(wrap, { "--wrapper-txt-y": 0 }); }
          },
          onUpdate: (self) => gsap.set(wrap, { "--wrapper-txt-y": "" + dist() * self.progress }),
        },
      });
      ScrollTrigger.create({ trigger: main.querySelector("[data-growth]"), start: "top 50%", endTrigger: "#op-footer", end: "bottom top", toggleClass: { targets: main.querySelector("[data-growth]"), className: "is-active" } });
      return () => { root.classList.remove("is-pinned"); gsap.set(wrap, { "--wrapper-txt-y": 0 }); };
    });
    const t = setTimeout(() => ScrollTrigger.refresh(), 100);
    return () => { clearTimeout(t); mm.revert(); };
  };
})();
