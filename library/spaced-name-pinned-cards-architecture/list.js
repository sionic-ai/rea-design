// Work list (original ProjectsListing): heading entrance, grid ↔ list view (1280px and up), filtering with the filter box below,
// On arrival, the first three cards trail down late from above
(() => {
  const { gsap, ScrollTrigger, reduce, EASE } = window.P;
  const root = document.documentElement;
  const views = document.querySelector("[data-views]");
  const grid = document.querySelector("[data-pgrid]");
  const cards = [...grid.querySelectorAll("[data-card]")];
  const rows = [...document.querySelectorAll("[data-prow]")].map((r) => ({
    r,
    title: r.querySelector("[data-prow-title]"),
    desc: r.querySelector("[data-prow-desc]"),
    tag: r.querySelector("[data-prow-tag]"),
    outs: [...r.querySelectorAll("[data-prow-out]")],
    ins: [...r.querySelectorAll("[data-prow-in]")],
    lines: [],
  }));
  const buttons = [...document.querySelectorAll("[data-view]")];
  const labels = [...document.querySelectorAll("[data-view-label]")];
  const dot = document.querySelector("[data-view-dot]");
  const lead = document.querySelector("[data-lead]");
  const xl = matchMedia("(min-width: 80rem)");
  const rem = () => parseFloat(getComputedStyle(root).fontSize);
  const d = (t) => (reduce ? 0 : t);
  let view = "grid", busy = false, leadSplit = null;

  // On arrival (1025px and up): the first three cards follow in from -30rem with the same 2s gl.fastInOut as the page coming down, each .1s later
  const drop = root.classList.contains("veil-in") ? 0 : root.classList.contains("load-in") ? 0.4 : null;
  if (drop !== null && !reduce && innerWidth >= 1025) {
    gsap.fromTo(cards.slice(0, 3), { y: -30 * rem() }, { y: 0, stagger: 0.1, duration: 2, ease: "gl.fastInOut", delay: drop });
  }

  const splitLead = () => {
    leadSplit?.revert();
    leadSplit = window.SplitText.create(lead, { type: "lines", mask: "lines", linesClass: "line" });
    return leadSplit.lines;
  };

  // List row reveal (original CardProjectInline): the name rises from 100% below, description lines follow .06s later by .05s each, chips unfold,
  // Four small photos start at outer panel -105% · inner 85% with .15s + .06s offsets (gl.quicky) — all 1.2s expo.out, .09s per line
  const rowInit = (p) => {
    gsap.set(p.title, { yPercent: 100 });
    gsap.set(p.lines, { yPercent: 100 });
    window.P.tagPrep(p.tag);
    gsap.set(p.outs, { yPercent: -105 });
    gsap.set(p.ins, { yPercent: 85 });
  };
  const rowReveal = (p) => {
    const tl = gsap.timeline({ defaults: { duration: d(1.2), ease: "expo.out" } })
      .set(p.r, { autoAlpha: 1 })
      .fromTo(p.title, { yPercent: 100 }, { yPercent: 0 }, 0)
      .fromTo(p.lines, { yPercent: 100 }, { yPercent: 0, stagger: d(0.05) }, d(0.06))
      .add(window.P.tagShow(p.tag), 0);
    [p.outs, p.ins].forEach((set) => set.forEach((x, w) => tl.to(x, { yPercent: 0, ease: "gl.quicky" }, d(0.15 + w * 0.06))));
    return tl;
  };
  const shownCards = () => cards.filter((c) => !c.hidden);
  const shownRows = () => rows.filter((p) => !p.r.hidden);
  const listIn = () => {
    const tl = gsap.timeline();
    shownRows().forEach((p, k) => { rowInit(p); tl.add(rowReveal(p), d(k * 0.09)); });
  };
  // When arriving as a grid: cards rise from 125% below in 1s expo.out (.025s each) and turn on .015s each
  const gridIn = () => {
    const t = shownCards();
    gsap.killTweensOf(t);
    gsap.timeline().fromTo(t, { yPercent: 125 }, { yPercent: 0, duration: d(1), ease: EASE, stagger: d(0.025) }).fromTo(t, { autoAlpha: 0 }, { autoAlpha: 1, stagger: d(0.015) }, "<");
  };
  // On leaving: the grid turns off from the back in .3s with -3%, the list turns off in .25s with -15% (1s power2.inOut) — swap once it is off
  const leave = (els, alpha, y, done) => {
    gsap.killTweensOf(els, "autoAlpha");
    gsap.timeline()
      .to(els, { autoAlpha: 0, stagger: view === "grid" ? -0.01 : 0, duration: d(alpha), ease: "power2.out", onComplete: done })
      .to(els, { yPercent: y, duration: d(1), ease: "power2.inOut" }, "<");
  };
  const setView = (v) => {
    if (v === view || busy) return;
    busy = true;
    buttons.forEach((b) => b.classList.toggle("is-on", b.dataset.view === v));
    views.classList.toggle("is-list", v === "list");
    const out = view === "grid" ? shownCards() : shownRows().map((p) => p.r);
    leave(out, view === "grid" ? 0.3 : 0.25, view === "grid" ? -3 : -15, () => {
      gsap.killTweensOf(out);
      gsap.set(out, { clearProps: "transform,opacity,visibility" });
      view = v;
      root.classList.toggle("is-list", v === "list");
      ScrollTrigger.refresh();
      v === "list" ? listIn() : gridIn();
      busy = false;
    });
  };
  buttons.forEach((b) => b.addEventListener("click", () => setView(b.dataset.view)));
  xl.addEventListener("change", () => !xl.matches && view === "list" && setView("grid"));

  // Filter: scroll up to turn off the current card and intro in .2s, keep only the matches and renumber the big-slot positions (1st and 10th of 14), then
  // About lines rise from 100% below (.8s, .06s each), cards rise from 25rem below after .1s, .07s each (1s expo.out)
  const applyFilter = async (value) => {
    if (busy) return;
    busy = true;
    window.P.lenis?.scrollTo(0);
    const out = view === "list" ? shownRows().map((p) => p.r) : shownCards();
    await Promise.all([gsap.to(out, { autoAlpha: 0, duration: d(0.2), ease: "power2.out" }), gsap.to(lead, { autoAlpha: 0, duration: d(0.2), ease: "power2.out" })]);
    const match = (el) => !value || el.dataset.cats.split("|").includes(value);
    cards.forEach((c) => (c.hidden = !match(c)));
    rows.forEach((p) => (p.r.hidden = !match(p.r)));
    shownCards().forEach((c, k) => c.classList.toggle("is-lg", k % 14 === 0 || k % 14 === 9));
    gsap.set(lead, { autoAlpha: 1 });
    gsap.fromTo(splitLead(), { yPercent: 100 }, { yPercent: 0, duration: d(0.8), ease: EASE, stagger: d(0.06) });
    ScrollTrigger.refresh();
    if (view === "list") listIn();
    else gsap.fromTo(shownCards(), { y: 25 * rem(), autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: d(1), ease: EASE, stagger: d(0.07), delay: d(0.1) });
    window.P.lenis?.resize();
    busy = false;
  };

  window.P.filters(document.querySelector("[data-filters]"), applyFilter);
  window.P.ready(() => {
    splitLead();
    rows.forEach((p) => (p.lines = window.SplitText.create(p.desc, { type: "lines", mask: "lines", linesClass: "line" }).lines));
    if (reduce) return;
    gsap.set(leadSplit.lines, { yPercent: 110 });
    gsap.set(labels, { yPercent: 100 });
    gsap.set(dot, { scale: 0 });
  });
  // Header entrance: intro lines rise from 110% below over 1s expo.out (.1s each) after .1s (.6s on the first-opened page), grid and list words at .7s by .2s each, the dot grows at .8s
  window.P.appear(() => {
    if (reduce) return;
    gsap.timeline()
      .to(leadSplit.lines, { yPercent: 0, duration: 1, ease: EASE, stagger: 0.1, delay: window.P.firstLoad ? 0.5 : 0 }, 0.1)
      .to(labels, { yPercent: 0, duration: 1, ease: EASE, stagger: 0.2 }, 0.7)
      .to(dot, { scale: 1, duration: 0.8, ease: EASE }, "<20%");
  });
})();
