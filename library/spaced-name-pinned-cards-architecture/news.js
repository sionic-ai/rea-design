// News list (original NewsListing): hero entrance, switching All News ↔ Filtered cards via the category pill · filter box, Load more,
// On arrival the two featured cards and category pills follow late from above and below
(() => {
  const { gsap, ScrollTrigger, reduce, EASE } = window.P;
  const root = document.documentElement;
  const all = document.querySelector("[data-news-all]");
  const filtered = document.querySelector("[data-news-filtered]");
  const catButtons = [...document.querySelectorAll("[data-ncat]")];
  const lead = document.querySelector("[data-lead]");
  const moreBtn = document.querySelector("[data-more]");
  const rem = () => parseFloat(getComputedStyle(root).fontSize);
  const d = (t) => (reduce ? 0 : t);
  let current = "", busy = false, box = null, leadLines = [];

  // On arrival: at 1025px and above, the two featured items follow from -30rem with the same 2s gl.fastInOut as the page coming down, each .1s later,
  // Category pills rise from below at 70% (120% below that width), .07s apart
  const drop = root.classList.contains("veil-in") ? 0 : root.classList.contains("load-in") ? 0.4 : null;
  if (drop !== null && !reduce) {
    const wide = innerWidth >= 1025;
    const tl = gsap.timeline({ delay: drop, defaults: { duration: 2, ease: "gl.fastInOut" } });
    if (wide) tl.fromTo([...all.querySelectorAll("[data-feat]")].slice(0, 2), { y: -30 * rem() }, { y: 0, stagger: 0.1 });
    tl.fromTo(catButtons, { yPercent: wide ? 70 : 120 }, { yPercent: 0, stagger: 0.07 }, "<");
  }

  // Swap: scrolls up, turns off the current panel’s cells in .2s (.02s each), swaps the panel, and new cells rise from 25rem below after .1s at .07s each (1s expo.out)
  const pick = (value) => {
    if (busy || value === current) return;
    busy = true;
    window.P.lenis?.scrollTo(0);
    box?.set(value || null);
    const out = current ? [...filtered.children].filter((c) => !c.hidden) : [...all.children];
    gsap.to(out, { autoAlpha: 0, duration: d(0.2), ease: "power2.out", stagger: current ? -0.01 : 0.02, onComplete: () => {
      gsap.set(out, { clearProps: "opacity,visibility" });
      current = value;
      catButtons.forEach((b) => b.classList.toggle("is-on", b.dataset.ncat === value));
      all.hidden = Boolean(value);
      filtered.hidden = !value;
      [...filtered.children].forEach((c) => (c.hidden = Boolean(value) && !c.querySelector(`[data-cats="${value}"]`)));
      const inn = value ? [...filtered.children].filter((c) => !c.hidden) : [...all.querySelectorAll("[data-feat]")];
      ScrollTrigger.refresh();
      gsap.fromTo(inn, { autoAlpha: 0, y: 25 * rem() }, { autoAlpha: 1, y: 0, duration: d(1), ease: EASE, stagger: d(0.07), delay: d(0.1), onComplete: () => { window.P.lenis?.resize(); ScrollTrigger.refresh(); busy = false; } });
    } });
  };
  catButtons.forEach((b) => b.addEventListener("click", () => pick(b.dataset.ncat)));

  // Show more: pull out five hidden rows and raise them from 2rem below over .8s expo.out (.08s apart), and remove the button when there are no more
  moreBtn.addEventListener("click", () => {
    const next = [...document.querySelectorAll("[data-more-row][hidden]")].slice(0, 5);
    next.forEach((r) => (r.hidden = false));
    if (!document.querySelector("[data-more-row][hidden]")) moreBtn.parentElement.hidden = true;
    gsap.fromTo(next, { autoAlpha: 0, y: 2 * rem() }, { autoAlpha: 1, y: 0, duration: d(0.8), ease: EASE, stagger: d(0.08) });
    ScrollTrigger.refresh();
    window.P.lenis?.resize();
  });

  box = window.P.filters(document.querySelector("[data-filters]"), (v) => pick(v || ""));
  window.P.ready(() => {
    leadLines = window.SplitText.create(lead, { type: "lines", mask: "lines", linesClass: "line" }).lines;
    if (!reduce) gsap.set(leadLines, { yPercent: 110 });
  });
  // About line: after .1s (.6s on the first-opened page) from 110% below with 1s expo.out, .1s each
  window.P.appear(() => {
    if (reduce) return;
    gsap.to(leadLines, { yPercent: 0, duration: 1, ease: EASE, stagger: 0.1, delay: 0.1 + (window.P.firstLoad ? 0.5 : 0) });
  });
})();
