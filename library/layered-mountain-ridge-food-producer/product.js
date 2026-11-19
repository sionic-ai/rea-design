// Category pill: original is /product/ct/<Category> It moves between pages, but since they share the same type, it looks skipped on a single page.
// Tags (Recommended · Best seller) gather cards into one ”Picked list” slot, while categories keep only that category’s slot. It opens directly via the #recommend address.
(() => {
  const pills = [...document.querySelectorAll(".pd-nav a")];
  const cats = [...document.querySelectorAll(".pd-cat[data-cat]")];
  const picked = document.querySelector(".pd-picked");
  const list = picked.querySelector("[data-picked-list]");
  const title = picked.querySelector("[data-picked-title]");

  const apply = (filter, label, smooth) => {
    pills.forEach((p) => p.classList.toggle("is-on", p.dataset.filter === filter));
    const [kind, val] = filter.split(":");
    picked.hidden = kind !== "tag";
    cats.forEach((c) => (c.hidden = kind === "tag" || (kind === "cat" && c.dataset.cat !== val)));
    if (kind === "tag") {
      title.textContent = label;
      list.replaceChildren(...[...document.querySelectorAll(`.pd-cat[data-cat] .pcard[data-tags~="${val}"]`)].map((n) => n.cloneNode(true)));
    }
    ScrollTrigger.refresh();
    gsap.fromTo("main > .pd-cat:not([hidden])", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: HS.reduced ? 0 : 0.5, ease: "power2.out", stagger: 0.05, clearProps: "transform" });
    gsap.set("main > .pd-cat:not([hidden]) [data-appear]", { opacity: 1, y: 0 });
    if (smooth) document.querySelector(".pd-nav").scrollIntoView({ behavior: HS.reduced ? "auto" : "smooth", block: "start" });
  };

  pills.forEach((p) =>
    p.addEventListener("click", (e) => {
      e.preventDefault();
      history.replaceState(null, "", p.getAttribute("href"));
      apply(p.dataset.filter, p.textContent, false);
    })
  );
  const start = pills.find((p) => p.getAttribute("href") === location.hash);
  if (start && start.dataset.filter !== "all") apply(start.dataset.filter, start.textContent, false);
})();
