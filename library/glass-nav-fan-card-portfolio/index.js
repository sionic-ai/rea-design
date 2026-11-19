// Work: card rise · filter pills (filtered cells stay in place but dim) · past work row pills. Row rise and preview deck are in shared.js.
(function () {
  const { $, $$, refreshVideos } = SH;
  const root = document.documentElement;

  const works = $(".h-works"), sw = $(".s-switch"), grid = $(".h-grid"), cards = $$("li", grid);
  cards.forEach((li, i) => li.style.setProperty("--index", i));
  // The pill floats only while the grid section spans the screen
  new IntersectionObserver((es) => es.forEach((e) => works.classList.toggle("is-inview", e.isIntersecting))).observe(works);
  const rise = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-inview"); rise.unobserve(e.target); } }), { rootMargin: "-20% 0px -20% 0px" });
  // If arriving from within the site, cards currently visible stay in place without rising (the original adds is-inview before the transition snapshot)
  if (SH.arrived) {
    root.classList.add("s-settle");
    cards.forEach((li) => { const r = li.getBoundingClientRect(); if (r.top < innerHeight * 0.8 && r.bottom > innerHeight * 0.2) li.classList.add("is-inview"); });
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove("s-settle")));
  }
  cards.forEach((li) => !li.classList.contains("is-inview") && rise.observe(li));

  $$("input", sw).forEach((inp, i) => inp.addEventListener("change", () => {
    sw.style.setProperty("--at", i);
    cards.forEach((li) => {
      const out = inp.value !== "all" && li.dataset.kind !== inp.value;
      li.classList.toggle("is-dimmed", out);
      li.toggleAttribute("inert", out);
    });
    refreshVideos();
  }));

  // Row pill: sticks to the left of the entered row. First appearance goes straight there, afterwards it moves between rows.
  // Hides on scroll, then reattaches to the row under the cursor 150ms after scrolling stops
  const ind = $(".s-row__ind"), rows = $$(".s-row");
  let on = null, hideRaf = null, scrollT = null, mx = 0, my = 0;
  const show = (row) => {
    if (row === on) return;
    const was = on !== null || parseFloat(getComputedStyle(ind).opacity) > 0;
    on = row;
    ind.classList.toggle("is-snapping", !was);
    ind.style.setProperty("--x", `${row.offsetLeft}px`);
    ind.style.setProperty("--y", `${row.offsetTop + row.offsetHeight / 2}px`);
    if (!was) { ind.offsetWidth; ind.classList.remove("is-snapping"); }
    ind.classList.add("is-visible");
  };
  const hide = () => { if (!on) return; on = null; ind.classList.remove("is-visible"); };
  const enter = (e) => { mx = e.clientX; my = e.clientY; if (scrollT === null) { cancelAnimationFrame(hideRaf); show(e.currentTarget); } };
  const leave = () => { cancelAnimationFrame(hideRaf); hideRaf = requestAnimationFrame(hide); };
  const onScroll = () => {
    clearTimeout(scrollT); hide();
    scrollT = setTimeout(() => { scrollT = null; const r = document.elementFromPoint(mx, my)?.closest(".s-row"); r && rows.includes(r) && show(r); }, 150);
  };
  gsap.matchMedia().add("(hover: hover) and (min-width: 700px)", () => {
    rows.forEach((r) => { r.addEventListener("mouseenter", enter); r.addEventListener("mouseleave", leave); });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { rows.forEach((r) => { r.removeEventListener("mouseenter", enter); r.removeEventListener("mouseleave", leave); }); window.removeEventListener("scroll", onScroll); hide(); };
  });
})();
