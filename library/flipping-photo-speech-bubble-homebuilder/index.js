// Home page: flowing collage and flip, banner sliding in, tabs, comparison table window, three-type contents list, story circle shrinking, two rows of request tickets, background color change.
// Original values: Splide autoScroll 0.5px/frame · second row of wishes -1 (reverse) · concept photo Splide fade 5s · flip at 4·9·10s intervals 1s ease-out · circle 1→0.4 scrub 1.
(() => {
  // The flowing row is the same Splide 4.1.2 + AutoScroll 0.5.3 as the original — speed is px per frame (for the second Requests row the original writes speed twice, so the later -1 wins)
  const flow = (el, speed, still) => el && new Splide(el, {
    type: "loop", autoWidth: true, arrows: false, pagination: false, pauseOnHover: false, pauseOnFocus: false, drag: !still,
    autoScroll: still ? false : { speed, pauseOnHover: false, pauseOnFocus: false },
  }).mount(window.splide.Extensions);
  // Two concept photos use Splide fade autoplay (original defaults as is — 5s interval, 0.4s transition)
  const fade = (el, still) => el && new Splide(el, {
    type: "fade", rewind: true, arrows: false, pagination: false, pauseOnHover: false, pauseOnFocus: false, autoplay: !still,
  }).mount();

  const banner = document.querySelector(".h-banner");
  // Case tabs: only the card group of the pressed category is shown (original swaps tab_content display — no transition motion)
  const tabs = [...document.querySelectorAll(".h-tabs__nav li")];
  const panels = [...document.querySelectorAll(".h-works [data-tab-panel]")];
  tabs.forEach((t, i) => t.addEventListener("click", () => {
    tabs.forEach((x) => x.classList.toggle("is-current", x === t));
    panels.forEach((p, n) => (p.hidden = n !== i));
    ScrollTrigger.refresh();
  }));

  const modal = document.querySelector(".h-modal");
  document.querySelector(".h-types__modal-btn")?.addEventListener("click", () => modal.classList.add("is-open"));
  modal?.querySelector(".h-modal__close").addEventListener("click", () => modal.classList.remove("is-open"));
  addEventListener("keydown", (e) => e.key === "Escape" && modal?.classList.remove("is-open"));

  // Switches the page background to the color of the last data-bg section that passed the screen center
  const bgs = [...document.querySelectorAll("[data-bg]")];
  const paintBg = () => {
    let now = "cream";
    for (const s of bgs) {
      const r = s.getBoundingClientRect();
      if (r.top + r.height / 2 <= innerHeight) now = s.dataset.bg;
    }
    document.body.classList.toggle("is-bg-white", now === "white");
  };
  addEventListener("scroll", paintBg, { passive: true });
  paintBg();

  const anchor = document.querySelector(".h-anchor");
  document.querySelectorAll(".h-type").forEach((sec, i) => {
    ScrollTrigger.create({
      trigger: sec, start: "top 50%", end: "bottom 50%",
      onToggle: (st) => {
        if (!st.isActive) return;
        anchor.querySelectorAll("[data-n]").forEach((li) => li.classList.toggle("is-current", li.dataset.n === String(i + 1)));
        anchor.style.setProperty("--tc-now", getComputedStyle(sec).getPropertyValue("--tc"));
      },
    });
  });

  const mm = gsap.matchMedia();
  mm.add({ motion: "(prefers-reduced-motion: no-preference)", still: "(prefers-reduced-motion: reduce)" }, (ctx) => {
    const still = ctx.conditions.still;
    const sliders = [
      flow(document.querySelector(".h-collage"), 0.5, still),
      flow(document.querySelector(".h-tickets.l"), 0.5, still),
      flow(document.querySelector(".h-tickets.r"), -1, still),
      ...[...document.querySelectorAll(".h-concept [data-fade]")].map((el) => fade(el, still)),
    ].filter(Boolean);
    if (still) {
      banner.classList.add("is-in");
      document.querySelectorAll(".h-type__big").forEach((el) => el.classList.add("is-in"));
      return () => sliders.forEach((sp) => sp.destroy());
    }
    requestAnimationFrame(() => banner.classList.add("is-in"));

    const flips = [[".flip1", 9000], [".flip2", 4000], [".flip3", 10000]].map(([sel, ms]) =>
      setInterval(() => document.querySelectorAll(`.h-collage ${sel}`).forEach((c) => c.classList.toggle("is-flip")), ms)
    );

    document.querySelectorAll(".h-type__big, .h-event__illust").forEach((el) =>
      ScrollTrigger.create({ trigger: el, start: "top 65%", once: true, onEnter: () => el.classList.add("is-in") })
    );

    // The original adds it to the timeline without a curve, so the GSAP default power1.out applies
    gsap.timeline({ scrollTrigger: { trigger: ".h-story__intro", start: "top top", end: "bottom bottom", scrub: 1 } }).to(".h-story__disc", {
      scale: 0.4,
    });

    return () => { flips.forEach(clearInterval); sliders.forEach((sp) => sp.destroy()); };
  });
})();
