// Home: slides are Splide 4.1.2 like the original — fade per hero season group (4.5s interval·1.5s cross), facility loop (4.5s interval·3s move·18% peek on the right),
// Banner (two fixed wide-screen slides, phone gets one looping slide plus arrows and dots), with a ”current / total” number inserted into the controls like the original script.
// While the News tab and plan range are visible, move the footer booking row to the plan spot.
(() => {
  // ─ Hero: each season spins on its own, and pressing a button makes that season’s set the first slide ─
  const heroes = [...document.querySelectorAll(".k-slides.splide")].map((el) => {
    const sp = new Splide(el, { type: "fade", rewind: true, autoplay: true, interval: 4500, speed: 1500, arrows: false, pagination: false, pauseOnHover: false, pauseOnFocus: false });
    sp.mount();
    return sp;
  });
  requestAnimationFrame(() => heroes.forEach((sp) => sp.go(0)));
  document.querySelectorAll(".k-season button").forEach((b) =>
    b.addEventListener("click", () => {
      const season = b.classList.contains("js-aki") ? "aki" : "natsu";
      document.querySelectorAll(".k-season button").forEach((x) => x.setAttribute("aria-pressed", x === b));
      document.querySelectorAll(".js-season").forEach((el) => { el.classList.toggle("is-aki", season === "aki"); el.classList.toggle("is-natsu", season === "natsu"); });
      heroes.filter((sp) => sp.root.dataset.season === season).forEach((sp) => sp.go(0));
    })
  );

  // ─ First-line news: as in the original, if the title is long (16+ chars on phone, 21+ on wide screens) the flow turns on ─
  document.querySelectorAll(".k-pickup__txt").forEach((el) => {
    const t = el.querySelector("span")?.textContent.trim() || "";
    if (t.length >= (innerWidth <= 767 ? 16 : 21)) el.classList.add("is-active");
  });

  // ─ Control numbers: move the dot group (pagination) in front of the pause button and place the current and total numbers before and after it (same as the original mounted handling) ─
  const counter = (sp, root) => {
    sp.on("mounted", () => {
      const pg = root.querySelector(".splide__pagination"), box = root.querySelector(".splide-controls");
      if (!pg || !box) return;
      const toggle = box.querySelector(".splide__toggle");
      toggle ? box.insertBefore(pg, toggle) : box.appendChild(pg);
      const cur = Object.assign(document.createElement("span"), { className: "splide__current" });
      const total = Object.assign(document.createElement("span"), { className: "splide__total" });
      box.insertBefore(cur, pg);
      pg.nextSibling ? box.insertBefore(total, pg.nextSibling) : box.appendChild(total);
      total.textContent = String(sp.length).padStart(2);
      cur.textContent = String(sp.index + 1).padStart(2);
    });
    sp.on("move", (i) => { const c = root.querySelector(".splide__current"); if (c) c.textContent = String(i + 1).padStart(2); });
  };

  // ─ Facilities ─
  document.querySelectorAll("[data-splide-fac]").forEach((root) => {
    const sp = new Splide(root, {
      type: "loop", pagination: true, autoplay: true, interval: 4500, speed: 3000, rewind: true, perPage: 1, perMove: 1, gap: 0,
      padding: { left: "0", right: "18%" },
      breakpoints: { 1199: { padding: { left: "0", right: "15%" } }, 767: { padding: { left: "0", right: "5%" } } },
    });
    counter(sp, root);
    sp.mount();
  });

  // ─ Banner ─
  document.querySelectorAll("[data-splide-bnr]").forEach((root) => {
    const sp = new Splide(root, {
      type: "slide", pagination: false, autoplay: false, interval: 4500, speed: 3000, rewind: true, perPage: 2, perMove: 1, focus: 0, gap: 20, drag: false, arrows: false,
      breakpoints: { 767: { type: "loop", drag: true, autoplay: true, interval: 4500, arrows: true, pagination: true, perPage: 1, padding: { left: "10%", right: "10%" } } },
    });
    counter(sp, root);
    sp.mount();
  });

  // ─ News tabs (move with arrow keys, pick with Enter·Space) ─
  const pick = (tab) => {
    const list = tab.closest('[role="tablist"]');
    list.querySelectorAll('[role="tab"]').forEach((t) => t.setAttribute("aria-selected", t === tab));
    tab.closest(".k-tabs").querySelectorAll('[role="tabpanel"]').forEach((p) => (p.hidden = p.id !== tab.getAttribute("aria-controls")));
  };
  document.querySelectorAll('[role="tab"]').forEach((tab) => {
    tab.addEventListener("click", () => pick(tab));
    tab.addEventListener("keydown", (e) => {
      const tabs = [...tab.closest('[role="tablist"]').querySelectorAll('[role="tab"]')];
      const k = tabs.indexOf(tab);
      if (e.key === "ArrowRight") { e.preventDefault(); tabs[(k + 1) % tabs.length].focus(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); tabs[(k - 1 + tabs.length) % tabs.length].focus(); }
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(tab); }
    });
  });

  // ─ When the plan section (forest green band) overlaps the screen, the footer booking row moves into that spot ─
  const inner = document.querySelector(".k-search__inner");
  const planBox = document.querySelector("[data-form-plan]");
  const homeBox = document.querySelector("[data-form-home]");
  const zone = document.querySelector(".k-green");
  if (inner && planBox && homeBox && zone) {
    new IntersectionObserver(([e]) => {
      const target = e.isIntersecting ? planBox : homeBox;
      if (inner.parentNode !== target) target.appendChild(inner);
    }, { threshold: 0 }).observe(zone);
  }
})();
