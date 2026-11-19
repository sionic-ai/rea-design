/* Home — hero slick fade, a cat crossing the worry section, blue fill in the expert section, two-row photo flow, horizontal row buttons */
(() => {
  const $ = window.jQuery;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Original slick 1.8.1 as is — fade, no arrows or dots. 1.5s after load, slickPlay (3s interval, .5s ease defaults)
  const kv = $(".kv__slides");
  kv.slick({ slidesToShow: 1, slidesToScroll: 1, dots: false, fade: true, arrows: false, pauseOnHover: false, pauseOnFocus: false });
  if (!reduce) addEventListener("load", () => setTimeout(() => kv.slick("slickPlay"), 1500));

  // Like the original, the photo flow row attaches one more copy of the same row so it flows continuously
  document.querySelectorAll("[data-loop]").forEach((loop) => {
    const list = loop.querySelector(".loop__list");
    const copy = list.cloneNode(true);
    copy.setAttribute("aria-hidden", "true");
    loop.append(copy);
  });

  // Horizontal row — one button pushes smoothly by one card (width + gap)
  document.querySelectorAll("[data-scroll-list]").forEach((list) => {
    const box = list.closest("section");
    const prev = box.querySelector("[data-scroll-prev]");
    const next = box.querySelector("[data-scroll-next]");
    const count = box.querySelector("[data-count]");
    const step = () => {
      const a = list.children[0], b = list.children[1];
      return b ? b.getBoundingClientRect().left - a.getBoundingClientRect().left : list.clientWidth;
    };
    const sync = () => {
      const max = list.scrollWidth - list.clientWidth - 2;
      if (prev) prev.disabled = list.scrollLeft <= 2;
      if (next) next.disabled = list.scrollLeft >= max;
      if (count) count.textContent = String(Math.round(list.scrollLeft / step()) + 1);
    };
    prev && prev.addEventListener("click", () => list.scrollBy({ left: -step() }));
    next && next.addEventListener("click", () => list.scrollBy({ left: step() }));
    list.addEventListener("scroll", sync, { passive: true });
    sync();
  });

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.registerPlugin(ScrollTrigger);
    // Worry section cat: from when the section’s top edge touches the screen bottom (0%) → to when the section’s bottom edge leaves the screen top (100%), left p% · translateX(−p%)
    const cat = document.querySelector(".concerns__cat");
    const t1 = gsap.fromTo(cat, { left: "0%", xPercent: 0 }, {
      left: "100%", xPercent: -100, ease: "none",
      scrollTrigger: { trigger: ".concerns", start: "top bottom", end: "bottom top", scrub: true },
    });

    // Expert section: blue fills by (scroll − (section top − window height)) ÷ (window height − header height + 450, 200 when narrow) and past .5 the text turns the background color
    const team = document.querySelector("[data-tint]");
    const head = document.querySelector(".u-header");
    const tint = () => {
      const top = team.getBoundingClientRect().top + scrollY;
      const start = top - innerHeight;
      if (scrollY <= start) { team.style.backgroundColor = ""; team.classList.remove("is-deep"); return; }
      const room = innerHeight - (head ? head.offsetHeight : 0) + (innerWidth < 1008 ? 200 : 450);
      let op = (scrollY - start) / room;
      if (matchMedia("(max-device-width: 1008px)").matches) op *= 0.8;
      op = Math.min(op, 1);
      team.classList.toggle("is-deep", op > 0.5);
      team.style.backgroundColor = `color-mix(in srgb, var(--site-blue) ${(op * 100).toFixed(2)}%, transparent)`;
    };
    addEventListener("scroll", tint, { passive: true });
    tint();
    return () => { t1.scrollTrigger && t1.scrollTrigger.kill(); removeEventListener("scroll", tint); team.style.backgroundColor = ""; };
  });
  mm.add("(prefers-reduced-motion: reduce)", () => {
    const team = document.querySelector("[data-tint]");
    team.style.backgroundColor = "var(--site-blue)";
    team.classList.add("is-deep");
  });
})();
