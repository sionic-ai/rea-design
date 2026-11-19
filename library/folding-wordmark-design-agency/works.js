/* Work list — pressing a category pill opens its tag list, and choosing tags leaves only the rows that have all of them. Sort (recent · alphabetical) · search ·
   List↔grid (fades out .5s, swaps after .5s, fades back in .5s), in list view hovering a row grows it from 230px → its own height in .4s power3.inOut */
(() => {
  const list = document.querySelector(".fr-works");
  const rows = [...list.querySelectorAll(".fr-work")];
  const cards = rows.map((r) => r.querySelector(".fr-work__card"));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const d = (s) => (reduce ? 0 : s);
  const showAll = () => document.querySelectorAll(".fr-enter").forEach((e) => e.classList.add("is-in"));

  // Category pill → opens only one tag list (press again to close)
  const catBtns = document.querySelectorAll("[data-cat].fr-mini");
  const lists = document.querySelectorAll(".fr-taglist");
  catBtns.forEach((b) => b.addEventListener("click", () => {
    const on = !b.classList.contains("is-active");
    catBtns.forEach((x) => x.classList.toggle("is-active", on && x === b));
    lists.forEach((l) => l.classList.toggle("is-active", on && l.dataset.cat === b.dataset.cat));
  }));

  // Tag filter — only rows that have all the selected tags
  let picked = [];
  const clear = document.querySelector(".fr-clear");
  function apply() {
    rows.forEach((r) => (r.style.display = picked.every((c) => r.classList.contains(c)) ? "" : "none"));
    lists.forEach((l) => l.classList.toggle("is-picked", !!l.querySelector(".fr-tagbtn.is-active")));
    clear.classList.toggle("is-active", picked.length > 0);
    showAll();
    ScrollTrigger.refresh();
  }
  document.querySelectorAll(".fr-tagbtn").forEach((b) => b.addEventListener("click", () => {
    window.scrollTo(0, 0);
    const on = b.classList.toggle("is-active");
    const n = b.dataset.name;
    picked = on ? [...new Set([...picked, n])] : picked.filter((c) => c !== n);
    document.querySelectorAll(`.fr-tagbtn[data-name="${n}"]`).forEach((x) => x.classList.toggle("is-active", picked.includes(n)));
    apply();
  }));
  clear.addEventListener("click", () => { picked = []; document.querySelectorAll(".fr-tagbtn.is-active").forEach((x) => x.classList.remove("is-active")); apply(); });

  // Sort
  document.querySelectorAll("[data-sort]").forEach((b) => b.addEventListener("click", () => {
    if (b.classList.contains("is-active")) return;
    document.querySelectorAll("[data-sort]").forEach((x) => x.classList.toggle("is-active", x === b));
    const by = b.dataset.sort;
    rows.sort((a, c) => (by === "name" ? a.dataset.name.localeCompare(c.dataset.name, "ko") : c.dataset.date - a.dataset.date)).forEach((r) => list.append(r));
    showAll();
    ScrollTrigger.refresh();
  }));

  // Search
  document.querySelector("[data-search]").addEventListener("input", (e) => {
    const q = e.target.value.trim().toLowerCase();
    rows.forEach((r) => (r.style.display = !q || r.dataset.name.toLowerCase().includes(q) ? "" : "none"));
    showAll();
    ScrollTrigger.refresh();
  });

  // List ↔ grid
  function view(to) {
    const btn = document.querySelector(`[data-view="${to}"]`);
    if (btn.classList.contains("is-active")) return;
    document.querySelectorAll("[data-view]").forEach((x) => x.classList.toggle("is-active", x === btn));
    gsap.to(list, { opacity: 0, duration: d(0.5), ease: "power1.inOut" });
    setTimeout(() => {
      list.classList.toggle("is-list", to === "list");
      list.classList.toggle("is-grid", to === "grid");
      gsap.set(cards, { clearProps: "height" });
      showAll();
      ScrollTrigger.refresh();
    }, d(0.5) * 1000);
    gsap.to(list, { opacity: 1, duration: d(0.5), ease: "power1.inOut", delay: d(0.5) });
    document.querySelectorAll(".fr-work__media").forEach((m) => (m.dataset.cursor = to === "grid" ? "pointer" : "none"));
  }
  document.querySelectorAll("[data-view]").forEach((b) => b.addEventListener("click", () => view(b.dataset.view)));

  // Expand rows in list view
  cards.forEach((c) => {
    c.addEventListener("mouseenter", () => { if (list.classList.contains("is-list") && innerWidth > 999) gsap.to(c, { height: "auto", duration: d(0.4), ease: "power3.inOut" }); });
    c.addEventListener("mouseleave", () => { if (list.classList.contains("is-list") && innerWidth > 999) gsap.to(c, { height: 230, duration: d(0.4), ease: "power3.inOut" }); });
  });
})();
