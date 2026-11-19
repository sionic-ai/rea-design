// Hero vertical text goes per character from (5px, -5px) over 1s with a .1s stagger, then the logo and demo circle are revealed over 1s.
// The title over the keyboard photo, when it reaches the screen center, drops letters from above with elasticity (1.35s elastic.out(1,.6), .05s apart).
// Series photo: when the white panel is centered, push it 40vw to the left.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const split = (el) => {
    const out = [];
    el.querySelectorAll(":scope > span").forEach((line) => {
      const text = line.textContent;
      line.textContent = "";
      [...text].forEach((c) => {
        const s = document.createElement("span");
        s.className = "ch";
        s.textContent = c;
        line.append(s);
        out.push(s);
      });
    });
    return out;
  };

  const catchChars = split(document.querySelector(".lp-mv__catch"));
  const others = document.querySelectorAll(".lp-mv-other");
  if (reduce) {
    gsap.set(others, { opacity: 1 });
  } else {
    gsap.timeline()
      .set(catchChars, { opacity: 0, x: 5, y: -5 })
      .to(catchChars, { opacity: 1, x: 0, y: 0, duration: 1, ease: "power1.out", stagger: 0.1 })
      .to(others, { opacity: 1, duration: 1, ease: "power1.inOut" });
  }

  const ttl = document.querySelector(".lp-daily__ttl");
  const ttlChars = split(ttl);
  if (!reduce) {
    gsap.fromTo(ttlChars, { y: "-1rem", opacity: 0, scaleY: 0.7 }, {
      y: "0rem", opacity: 1, scaleY: 1, duration: 1.35, ease: "elastic.out(1, 0.6)",
      stagger: { each: 0.05, from: "start", ease: "sine.inOut" },
      scrollTrigger: { trigger: ttl, start: "top center", once: true },
    });
  }

  // Performer slide: same Swiper 11.2.10 as the original, same settings (endless, centered, equal height, 1s, 01/09)
  const sw = document.querySelector(".lp-voice__swiper");
  const pad2 = (n) => String(n).padStart(2, "0");
  if (sw && window.Swiper) {
    new Swiper(sw, {
      loop: true, slidesPerView: 1.15, centeredSlides: true, autoHeight: true, speed: reduce ? 0 : 1000,
      navigation: { nextEl: sw.querySelector(".lp-voice__next"), prevEl: sw.querySelector(".lp-voice__prev") },
      pagination: {
        el: sw.querySelector(".lp-voice__frac"), type: "fraction",
        renderFraction: (cur, total) => `<span class="${cur}"></span>/<span class="${total}"></span>`,
        formatFractionCurrent: pad2, formatFractionTotal: pad2,
      },
      breakpoints: { 768: { slidesPerView: 3 } },
    });
  }

  gsap.matchMedia().add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll(".lp-series").forEach((sec) => {
      gsap.to(sec.querySelector(".lp-series__img"), {
        "--move-x": -20, duration: 1, ease: "power1.inOut",
        scrollTrigger: { trigger: sec.querySelector(".lp-series__panel"), start: "top center", toggleActions: "play none none reverse" },
      });
    });
  });
})();
