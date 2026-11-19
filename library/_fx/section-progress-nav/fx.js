// Section list: each row links the section named in data-target. While the section passes the screen center (at), that row’s underline (bar) grows 0 → 100% (scrub, no curve),
// When entered (from either direction), aria-current is attached to that row. Leaving the area downward returns the underline to 0. Pressing a row glides to that area
(() => {
  kfFx.register("section-progress-nav", (el, { options, reduce, scroller }) => {
    gsap.registerPlugin(ScrollTrigger);
    const rows = [...el.querySelectorAll('[data-fx-part="row"]')]
      .map((row) => ({ row, bar: row.querySelector('[data-fx-part="bar"]'), sec: row.dataset.target && document.querySelector(row.dataset.target) }))
      .filter((r) => r.sec);
    if (!rows.length) return;
    const at = +(options.at ?? 0.5);
    const dur = +(options.dur ?? 1.8);
    const top = (s) => s.getBoundingClientRect().top + scrollY;
    const bottom = (s) => s.getBoundingClientRect().bottom + scrollY;
    const mark = (row) => rows.forEach((r) => (r.row === row ? r.row.setAttribute("aria-current", "true") : r.row.removeAttribute("aria-current")));
    const made = [];
    const ac = new AbortController();
    rows.forEach(({ row, bar, sec }) => {
      const range = { trigger: sec, ...(scroller && { scroller }), start: () => top(sec) - innerHeight * at, end: () => bottom(sec) - innerHeight * at, invalidateOnRefresh: true };
      made.push(ScrollTrigger.create({ ...range, onEnter: () => mark(row), onEnterBack: () => mark(row) }));
      if (bar) {
        gsap.set(bar, { width: "0%" });
        if (!reduce) made.push(gsap.to(bar, { width: "100%", ease: "none", scrollTrigger: { ...range, scrub: true, onLeave: () => gsap.set(bar, { width: "0%" }) } }));
      }
      row.addEventListener("click", (e) => {
        e.preventDefault();
        if (window.lenis?.scrollTo) window.lenis.scrollTo(sec, { duration: dur });
        else sec.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
      }, { signal: ac.signal });
    });
    return () => {
      ac.abort();
      made.forEach((m) => (m.scrollTrigger ? (m.scrollTrigger.kill(), m.kill()) : m.kill()));
      rows.forEach(({ row, bar }) => { row.removeAttribute("aria-current"); if (bar) gsap.set(bar, { clearProps: "width" }); });
    };
  });
})();
