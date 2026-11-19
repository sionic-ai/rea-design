// Work list — original work nameplate: title row, filter buttons and cards rise in turn, and the buttons filter by service
(() => {
  let split = null;
  window.MO && MO.page("work", {
    set(root) {
      const h = root.querySelector(".wk__heading");
      split = h ? new SplitText(h, { type: "lines", linesClass: "split-line", mask: "lines" }) : null;
      if (split) gsap.set(split.lines, { yPercent: 110 });
      gsap.set(root.querySelectorAll(".wk__filter"), { autoAlpha: 0, y: 12 });
      gsap.set(root.querySelectorAll(".wk__link"), { autoAlpha: 0, yPercent: 15 });
      gsap.set(root.querySelector(".mo-nav"), { autoAlpha: 0 });
    },
    intro(root) {
      const { D } = MO, q = (s) => root.querySelectorAll(s);
      const tl = gsap.timeline({ defaults: { ease: "ease-transition" } });
      tl.set(q("[data-animate]"), { autoAlpha: 1 });
      if (split) tl.to(split.lines, { yPercent: 0, duration: D.slow, stagger: 0.05 }, 0);
      tl.to(q(".wk__filter"), { y: 0, duration: D.slow, stagger: 0.04 }, "<0.1")
        .to(q(".wk__filter"), { autoAlpha: 1, duration: D.fast, stagger: 0.04 }, "<")
        .to(q("[data-eyebrow-intro]"), { autoAlpha: 1, duration: D.fast }, "<")
        .to(q(".wk__link"), { yPercent: 0, duration: D.slow, stagger: { each: 0.05, from: "start" }, clearProps: "transform" }, "<")
        .to(q(".wk__link"), { autoAlpha: 1, duration: D.fast, stagger: { each: 0.05, from: "start" }, clearProps: "opacity,visibility" }, "<");
      return MO.navIntro(tl, root, "<0.25");
    },
    // Filter: cards that will vanish are removed 300ms after transition-out (.25s fade), and the remaining cards come back in .3s
    init(root) {
      const group = root.querySelector("[data-filter-group]");
      if (!group) return;
      const btns = [...group.querySelectorAll("[data-filter-target]")], items = [...group.querySelectorAll("[data-filter-name]")];
      const tags = new Map(items.map((el) => [el, new Set(el.dataset.filterName.trim().toLowerCase().split(/\s+/).filter(Boolean))]));
      const count = root.querySelector('[data-count-display="work"]');
      if (count) count.textContent = String(items.length).padStart(2, "0");
      let cur = "all";
      const apply = (name) => {
        cur = !name || name === "all" ? "all" : name;
        items.forEach((el) => {
          clearTimeout(el._ft);
          const keep = cur === "all" || tags.get(el).has(cur);
          if (el.dataset.filterStatus === "active") el.dataset.filterStatus = "transition-out";
          el._ft = setTimeout(() => { el.dataset.filterStatus = keep ? "active" : "not-active"; el.setAttribute("aria-hidden", keep ? "false" : "true"); }, 300);
        });
        btns.forEach((b) => { const on = b.dataset.filterTarget === cur; b.dataset.filterStatus = on ? "active" : "not-active"; b.setAttribute("aria-pressed", String(on)); });
      };
      const click = (e) => { const b = e.target.closest("[data-filter-target]"); if (b && group.contains(b)) apply(b.dataset.filterTarget); };
      group.addEventListener("click", click);
      return () => { group.removeEventListener("click", click); items.forEach((el) => clearTimeout(el._ft)); split?.revert?.(); split = null; };
    },
  });
})();
