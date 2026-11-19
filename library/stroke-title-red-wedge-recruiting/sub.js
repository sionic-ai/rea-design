// Subpage interaction and scroll devices — attach only what each page has.
// People list: filtering by keyword or category updates the count and the “none” message and replays the list rise. On phones, pressing a tab unfolds the panel from the top in .3s power3.out,
//   On close the content vanishes over .2s, then .2s later the plate folds over .3s power2.out. On wide screens, after filtering, if the list head is above the screen it scrolls up to it over .4s power3.out.
// Work detail: the hero background is pushed 120px on scroll, when the body reaches the top of the screen the TOC sticks and the current section turns red (30~70% band of the screen), and clicking the TOC takes distance × .0005 s (.6~.9) power2.inOut.
// Interview detail: header text is white only while it is over the dark hero, body lines float up when visible, and is-enter is added when a section body passes screen center.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sp = () => matchMedia("(max-width: 768px)").matches;
  const scroller = document.scrollingElement || document.documentElement;

  // ── People List ──
  const filter = document.querySelector(".js-filter");
  if (filter) {
    const selects = [...filter.querySelectorAll("select")], keys = [...filter.querySelectorAll(".js-filter-keyword")];
    const items = [...document.querySelectorAll(".js-people-list > li")], content = document.querySelector(".js-content");
    const count = document.querySelector(".js-count"), none = document.querySelector(".js-no-result"), reset = filter.querySelector(".js-filter-reset");
    const panel = filter.querySelector(".js-filter-contents"), panes = [...filter.querySelectorAll(".js-filter-content")], action = filter.querySelector(".kk-filter__action");
    const nums = { keyword: filter.querySelector('[data-type="keyword"] .kk-filter__num'), category: filter.querySelector('[data-type="category"] .kk-filter__num') };
    items.forEach((li, i) => li.style.setProperty("--i", i));
    const apply = () => {
      const want = keys.filter((k) => k.checked).map((k) => k.value);
      let n = 0;
      items.forEach((li) => {
        const ok = selects.every((s) => !s.value || li.dataset[s.dataset.category] === s.value) && want.every((k) => li.dataset.keys.split(",").includes(k));
        li.style.display = ok ? "" : "none";
        if (ok) li.style.setProperty("--i", n++);
      });
      count.textContent = n;
      none.style.display = n ? "none" : "";
      const any = want.length || selects.some((s) => s.value);
      reset.disabled = !any;
      nums.keyword.textContent = want.length || "";
      nums.category.textContent = selects.filter((s) => s.value).length || "";
      content.classList.remove("is-inview"); void content.offsetWidth; content.classList.add("is-inview");
      if (!sp()) { const top = content.getBoundingClientRect().top; if (top < 0) gsap.to(scroller, { scrollTop: Math.max(0, scrollY + top - 100), duration: reduce ? 0 : 0.4, ease: "power3.out", overwrite: "auto" }); }
    };
    const label = (s) => s.parentElement.dataset.text = s.options[s.selectedIndex].textContent.trim();
    selects.forEach((s) => s.addEventListener("change", () => { label(s); apply(); }));
    keys.forEach((k) => k.addEventListener("change", apply));
    reset.addEventListener("click", () => { selects.forEach((s) => { s.value = ""; label(s); }); keys.forEach((k) => (k.checked = false)); apply(); });
    filter.querySelector(".js-filter-type-reset").addEventListener("click", () => {
      if (filter.dataset.activeTab === "category") selects.forEach((s) => { s.value = ""; label(s); }); else keys.forEach((k) => (k.checked = false));
      apply();
    });
    const open = (type) => {
      const was = filter.classList.contains("is-open");
      filter.dataset.activeTab = type; filter.classList.add("is-open");
      if (!sp()) return;
      const pane = panes.find((p) => p.dataset.type === type);
      const tl = gsap.timeline();
      if (!was) { gsap.set(panel, { scaleY: 0, transformOrigin: "top" }); gsap.set([pane, action], { opacity: 0 }); tl.to(panel, { scaleY: 1, duration: reduce ? 0 : 0.3, ease: "power3.out", onComplete: () => gsap.set(panel, { clearProps: "all" }) }); }
      tl.to([pane, action], { opacity: 1, duration: reduce ? 0 : 0.3, ease: "power3.out" }, 0);
    };
    const close = async () => {
      if (sp()) {
        const pane = panes.find((p) => p.dataset.type === filter.dataset.activeTab);
        const tl = gsap.timeline();
        tl.to([action, pane], { opacity: 0, duration: reduce ? 0 : 0.2, ease: "power3.out" }, 0);
        tl.set(panel, { transformOrigin: "top" }, 0).to(panel, { scaleY: 0, duration: reduce ? 0 : 0.3, ease: "power2.out" }, 0.2);
        await tl;
        gsap.set([panel, ...panes, action], { clearProps: "all" });
      }
      filter.classList.remove("is-open"); filter.dataset.activeTab = "";
    };
    filter.querySelectorAll(".js-filter-tab").forEach((t) => t.addEventListener("click", () => (filter.classList.contains("is-open") && filter.dataset.activeTab === t.dataset.type ? close() : open(t.dataset.type))));
    filter.querySelector(".js-filter-close").addEventListener("click", close);
  }

  // ── Work Detail ──
  const dhero = document.querySelector(".js-dhero"), dbg = document.querySelector(".js-dbg");
  if (dhero && dbg && !reduce) {
    let on = false;
    const tick = () => { const r = dhero.getBoundingClientRect(); dbg.style.setProperty("--kk-progress", Math.max(0, Math.min(1, r.height > 0 ? -r.top / r.height : 0)).toFixed(4)); if (on) requestAnimationFrame(tick); };
    new IntersectionObserver((es) => { const v = es.some((e) => e.isIntersecting); if (v && !on) { on = true; requestAnimationFrame(tick); } else if (!v) on = false; }).observe(dhero);
  }
  const index = document.querySelector(".kk-index");
  if (index) {
    const body = index.querySelector(".js-index-content"), links = [...index.querySelectorAll(".kk-toc__link")], secs = [...index.querySelectorAll(".js-section")];
    // The table of contents shows only once the body touches the top of the screen, and by then the first section is already inside the band (original) — so the first section is set as current even before it is visible
    links[0]?.classList.add("is-active");
    new IntersectionObserver(([e]) => index.classList.toggle("is-menu-shown", e.isIntersecting), { rootMargin: "0px 0px -100% 0px" }).observe(body);
    const seen = new Set();
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => (e.isIntersecting ? seen.add(e.target) : seen.delete(e.target)));
      const now = secs.find((s) => seen.has(s));
      if (now) links.forEach((a) => a.classList.toggle("is-active", a.dataset.id === now.id));
    }, { rootMargin: "-30% 0px -70% 0px" });
    secs.forEach((s) => io.observe(s));
    links.forEach((a) => a.addEventListener("click", (e) => {
      const t = document.getElementById(a.dataset.id); if (!t) return;
      e.preventDefault();
      const to = t.getBoundingClientRect().top + scrollY, d = Math.min(0.9, Math.max(0.6, Math.abs(to - scrollY) * 0.0005));
      gsap.to(scroller, { scrollTop: to, duration: reduce ? 0 : d, ease: "power2.inOut", overwrite: "auto" });
    }));
  }

  // ── Interview Detail ──
  const ahero = document.querySelector(".js-ahero"), ahead = document.querySelector(".js-ahead");
  if (ahero && ahead) {
    const setH = () => document.documentElement.style.setProperty("--head-h", `${ahead.firstElementChild.offsetHeight}px`);
    setH(); addEventListener("resize", setH);
    const inv = [...ahead.querySelectorAll(".js-invert")];
    let ticking = false;
    const paint = () => { ticking = false; const edge = ahero.getBoundingClientRect().bottom; inv.forEach((el) => { const r = el.getBoundingClientRect(); el.classList.toggle("is-invert", r.top + r.height / 2 <= edge); }); };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(paint); } };
    paint(); addEventListener("scroll", onScroll, { passive: true }); addEventListener("resize", onScroll);
    const texts = document.querySelectorAll(".js-section-text h4, .js-section-text p");
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-inview"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -15% 0px" });
    texts.forEach((t) => io.observe(t));
    document.querySelectorAll(".js-detail-section .kk-asec__main").forEach((m) => ScrollTrigger.create({ trigger: m, start: "top 50%", onEnter: () => m.classList.add("is-enter"), onLeaveBack: () => m.classList.remove("is-enter") }));
  }
})();
