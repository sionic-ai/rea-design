// First-page only: hero entrance order, photo band (swiper), scroll-bound parallax and planes, usage example and transfer screen switching, News tabs, touch payment note.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const OUT_CIRC = "circ.out";
  gsap.registerPlugin(ScrollTrigger);

  // ── Hero: the original Webflow bundle runs twice — first the three title lines (.4/.4/.6s, each .1s later), the description (after .6s), the badge (after 1s),
  //    after that group finishes (1.6s) the photo cell turns on .2s later from 20px below
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const rows = [...document.querySelectorAll(".kv__type")];
    const tl = gsap.timeline();
    rows.forEach((r, i) => tl.fromTo(r, { y: () => parseFloat(getComputedStyle(r).fontSize) * 1.1 }, { y: 0, duration: [0.4, 0.4, 0.6][i] ?? 0.6, ease: OUT_CIRC }, i * 0.1));
    tl.fromTo("[data-kv=desc]", { yPercent: 110 }, { yPercent: 0, duration: 0.6, ease: OUT_CIRC }, 0.6);
    tl.fromTo("[data-kv=badges]", { yPercent: 100 }, { yPercent: 0, duration: 0.6, ease: OUT_CIRC }, 1.0);
    tl.fromTo("[data-kv=img]", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: OUT_CIRC }, 1.8);

    // Big numbers 1·2·3 sit 40% lower as the cell enters, then settle in place as the cell passes 80% of the screen (original smoothing 60)
    document.querySelectorAll("[data-num]").forEach((n) => gsap.fromTo(n, { yPercent: 40 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: n.closest("li"), start: "top bottom", end: () => `+=${(innerHeight + n.closest("li").offsetHeight) * 0.8}`, scrub: 0.6 } }));
    // Payment reason photo: inside the cell from 13% down → in place (90%), while the cell passes
    document.querySelectorAll("[data-par-pay] .wf-img").forEach((p) => gsap.fromTo(p, { yPercent: 13 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: p.parentElement, start: "top bottom", end: "bottom top", scrub: 0.5 } }));
    // Current incoming photo: 0 → −25% (up to the 80% mark)
    const lend = document.querySelector("[data-par-lend] .wf-img");
    if (lend) gsap.fromTo(lend, { yPercent: 0 }, { yPercent: -25, ease: "none", scrollTrigger: { trigger: lend.closest("section"), start: "top bottom", end: () => `+=${(innerHeight + lend.closest("section").offsetHeight) * 0.8}`, scrub: 0.6 } });
    // Big sky-blue circle in the ledger section: shrinks to .9x while the section passes and drifts down 20%
    const fill = document.querySelector("[data-fill-manage]");
    if (fill) gsap.fromTo(fill, { scale: 1, yPercent: 0 }, { scale: 0.9, yPercent: 20, ease: "none", scrollTrigger: { trigger: fill.closest("section"), start: "top bottom", end: "bottom top", scrub: 0.6 } });
    // Big ON/OFF·LOCK text in the reassurance section: 15% below → in place
    document.querySelectorAll("[data-typo]").forEach((t) => gsap.fromTo(t, { yPercent: 15 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: t.closest(".safety__card"), start: "top bottom", end: "bottom top", scrub: 0.5 } }));
    const sf = document.querySelector("[data-fill-safety]");
    if (sf) gsap.matchMedia().add("(max-width: 991px)", () => {
      gsap.fromTo(sf, { yPercent: -100 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: sf.parentElement, start: "top bottom", end: () => `+=${(innerHeight + sf.parentElement.offsetHeight) * 0.45}`, scrub: 0.5 } });
    });
    // When a screen group passes 10% above the bottom of the screen, it turns on over .4s from 20px below
    document.querySelectorAll(".intoview").forEach((s) => gsap.fromTo(s, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: OUT_CIRC, scrollTrigger: { trigger: s, start: "top 90%", once: true } }));
  });

  // ── Photo strip: original swiper settings as is (centered loop, width is each cell’s own width)
  if (window.Swiper && document.querySelector(".kv__slider")) {
    new Swiper(".kv__slider", {
      autoplay: reduce ? false : { delay: 4000 },
      centeredSlides: true,
      loop: true,
      spaceBetween: 15,
      speed: reduce ? 0 : 600,
      slidesPerView: "auto",
      breakpoints: { 640: { spaceBetween: 30 }, 980: { spaceBetween: 50, autoplay: reduce ? false : { delay: 3000 } } },
    });
  }

  // ── News tabs: the current panel turns off in .25s, then the chosen panel turns on in .15s (original ease-in-circ)
  document.querySelectorAll("[data-tabs]").forEach((wrap) => {
    const tabs = [...wrap.querySelectorAll("[data-tab]")], panes = [...wrap.querySelectorAll("[data-pane]")];
    tabs.forEach((t, k) => t.addEventListener("click", () => {
      const cur = panes.find((p) => p.classList.contains("is-current"));
      if (cur === panes[k]) return;
      tabs.forEach((x, j) => x.classList.toggle("is-current", j === k));
      const inNext = () => { cur?.classList.remove("is-current"); panes[k].classList.add("is-current"); gsap.fromTo(panes[k], { opacity: 0 }, { opacity: 1, duration: reduce ? 0 : 0.15, ease: "circ.in" }); };
      if (cur && !reduce) gsap.to(cur, { opacity: 0, duration: 0.25, ease: "circ.in", onComplete: inNext });
      else inNext();
    }));
  });

  // ── Touch checkout note: on touch or press it turns on in .5s from 10px below, on release or ✕ it turns off over the same length ──
  const touch = document.querySelector("[data-touch]");
  const card = touch?.querySelector("[data-touch-float]");
  if (touch && card) {
    const on = () => { gsap.killTweensOf(card); gsap.set(card, { display: "block", pointerEvents: "all" }); gsap.fromTo(card, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: reduce ? 0 : 0.5, ease: OUT_CIRC }); };
    const off = () => { gsap.killTweensOf(card); gsap.to(card, { y: 10, opacity: 0, duration: reduce ? 0 : 0.5, ease: OUT_CIRC, onComplete: () => gsap.set(card, { display: "none", pointerEvents: "none" }) }); };
    touch.addEventListener("mouseenter", on);
    touch.addEventListener("mouseleave", off);
    touch.addEventListener("click", (e) => { if (e.target.closest(".touch__x")) { e.stopPropagation(); off(); } else on(); });
  }
})();
