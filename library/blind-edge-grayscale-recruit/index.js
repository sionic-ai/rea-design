// Home: after the loader, hero settle-down · intro text fill-up · swapping photos by hovering the business list · name rows flowing in opposite directions.
// Original values: hero y -28vh → 0 1.2s expo.out (delay .3) then copy 1s power4.out · letter color stagger .05 scrub 1 top 50%→bottom 40%
// · Photo swap opacity .4s power1.out · Name row xPercent ±10 scrub 1 top bottom→bottom top.
(() => {
  const MT = window.MT;
  const kv = document.querySelector(".kv");
  const inner = kv.querySelector(".kv__inner");
  const first = kv.querySelectorAll(".kv__copy--first");
  const second = kv.querySelectorAll(".kv__copy--second");

  const fitKv = (animate) => {
    if (animate) kv.classList.add("is-kv-animated");
    kv.classList.add("is-kv-fitted");
    setTimeout(() => ScrollTrigger.refresh(), animate ? 1600 : 0);
  };

  if (MT.playIntro) {
    gsap.set(inner, { y: -parseFloat(getComputedStyle(kv).paddingTop) });
    gsap.set([first, second], { opacity: 0 });
  }
  MT.hooks.push((tl, played) => {
    if (!played) { fitKv(false); return; }
    tl.to(inner, { y: 0, duration: 1.2, delay: 0.3, ease: "expo.out", clearProps: "transform", onStart: () => fitKv(true) })
      .to(first, { opacity: 1, duration: 1, ease: "power4.out" })
      .to(second, { opacity: 1, duration: 1, delay: 0.5, ease: "power4.out" });
  });

  // About text: only the visible paragraph is split letter by letter
  const fill = [...document.querySelectorAll("[data-fill]")].find((p) => p.offsetParent !== null);
  if (fill) {
    const text = fill.textContent.trim();
    fill.setAttribute("aria-label", text);
    fill.innerHTML = [...text].map((c) => `<span aria-hidden="true">${c}</span>`).join("");
    const chars = fill.querySelectorAll("span");
    const ink = getComputedStyle(document.documentElement).getPropertyValue("--kf-ink").trim();
    if (MT.reduced) gsap.set(chars, { color: ink });
    else gsap.fromTo(chars, { color: getComputedStyle(fill).color }, {
      color: ink, ease: "none", duration: 0.05, stagger: 0.05,
      scrollTrigger: { trigger: fill, start: "top 50%", end: "bottom 40%", scrub: 1 },
    });
  }

  // Hover a work list item and the big photo on the left switches to that work’s photo
  const layers = [...document.querySelectorAll("[data-work-layer]")];
  let shown = null;
  document.querySelectorAll("[data-work-link]").forEach((link) => {
    link.addEventListener("mouseenter", () => {
      const layer = layers[+link.dataset.workLink];
      if (!layer || shown === layer) return;
      shown = layer;
      layers.forEach((l) => gsap.to(l, { opacity: l === layer ? 1 : 0, duration: 0.4, ease: "power1.out", overwrite: "auto" }));
    });
  });

  // Name rows: even rows shift 10% right, odd rows 10% left
  if (!MT.reduced) {
    const rows = document.querySelector(".rows");
    document.querySelectorAll("[data-row]").forEach((row, i) => {
      gsap.fromTo(row, { xPercent: 0 }, {
        xPercent: i % 2 === 0 ? 10 : -10, ease: "none",
        scrollTrigger: { trigger: rows, start: "top bottom", end: "bottom top", scrub: 1, invalidateOnRefresh: true },
      });
    });
  }
})();
