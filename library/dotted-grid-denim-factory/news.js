// News-only: the original moves to a different address per category, but here the same list is filtered by data-cat and shown on one page.
(window.SBP ||= {}).news = (root, SB) => {
  const items = [...root.querySelectorAll(".nw-list > li")];
  const btns = root.querySelectorAll("[data-filter]");
  btns.forEach((btn) => {
    btn.addEventListener("click", () => {
      btns.forEach((b) => b.classList.toggle("is-active", b === btn));
      const f = btn.dataset.filter;
      items.forEach((li) => (li.hidden = f !== "all" && li.dataset.cat !== f));
      if (!SB.reduced) gsap.fromTo(items.filter((li) => !li.hidden), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power3.out" });
      ScrollTrigger.refresh();
    });
  });
};
