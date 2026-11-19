// Motion unique to sub-sections — current section marker in the workflow table of contents, work list filtering (re-laid in .22s) and card float-up (original data-work-card-body)
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Flow section — when a section’s top edge crosses the screen center, a dot attaches to its name
  const items = [...document.querySelectorAll("[data-flow-item]")];
  const navs = [...document.querySelectorAll("[data-flow-nav]")];
  if (items.length && navs.length) {
    const mark = (id) => navs.forEach((n) => { n.dataset.current = n.dataset.flowNav === id ? "true" : "false"; });
    mark(items[0].id);
    items.forEach((it) => ScrollTrigger.create({ trigger: it, start: "top center", end: "bottom center", onToggle: (s) => s.isActive && mark(it.id) }));
    navs.forEach((n) => n.querySelector("a").addEventListener("click", (e) => {
      const to = document.getElementById(n.dataset.flowNav);
      if (!to || !window.cnLenis) return;
      e.preventDefault();
      window.cnLenis.scrollTo(to, { offset: -120 });
    }));
  }

  // Results list — pressing a category keeps only the chosen branch and the list re-lays out in .22s
  const filter = document.querySelector("[data-work-filter]"), list = document.querySelector("[data-work-list]");
  if (filter && list) {
    filter.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-cat]");
      if (!btn || btn.getAttribute("aria-pressed") === "true") return;
      filter.querySelectorAll("[data-cat]").forEach((b) => b.setAttribute("aria-pressed", b === btn ? "true" : "false"));
      list.querySelectorAll("[data-cat]").forEach((li) => { li.hidden = btn.dataset.cat !== "all" && li.dataset.cat !== btn.dataset.cat; });
      list.classList.remove("is-fade"); void list.offsetWidth; list.classList.add("is-fade");
      ScrollTrigger.refresh();
    });
  }

  // Card body — on reaching 70% of the screen, rises from 24px below in .7s power2.out (once)
  const bodies = [...document.querySelectorAll("[data-work-card-body]")];
  if (bodies.length && !reduce) {
    gsap.set(bodies, { opacity: 0, y: 24 });
    bodies.forEach((b) => ScrollTrigger.create({ trigger: b, start: "top 70%", once: true, onEnter: () => gsap.to(b, { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" }) }));
  }
})();
