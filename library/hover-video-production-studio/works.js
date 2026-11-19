// Work list: filter by category pills (can open directly with a URL like #cm — the original’s category page spot), text and illustration toggle (remembered on next open),
// Year header line pin · toggle button pin (original ScrollTrigger pin), and on touch devices the line passing through the screen center gets the hover.
MR.page("works", (box) => {
  const { touch } = window.MR;
  const index = box.querySelector(".mr-windex");
  const items = [...index.querySelectorAll(".mr-wi")];
  const groups = [...index.querySelectorAll(".mr-wgroup")];
  const cats = [...box.querySelectorAll(".mr-cats button")];
  const catName = box.querySelector(".mr-whead__cat");
  const count = box.querySelector(".mr-whead__count");
  const pad = (n) => `(${String(n).padStart(2, "0")})`;

  const filter = (cat, push = true) => {
    const btn = cats.find((b) => b.dataset.cat === cat) || cats[0];
    cats.forEach((b) => b.classList.toggle("is-current", b === btn));
    let n = 0;
    items.forEach((it) => { const show = btn.dataset.cat === "all" || it.dataset.cat === btn.dataset.cat; it.classList.toggle("is-hidden", !show); n += show; });
    groups.forEach((g) => g.classList.toggle("is-empty", !g.querySelector(".mr-wi:not(.is-hidden)")));
    catName.textContent = btn.querySelector(".mr-roll__t > span")?.textContent || btn.textContent.trim();
    count.textContent = pad(n);
    if (push) history.replaceState(history.state, "", btn.dataset.cat === "all" ? location.pathname : `#${btn.dataset.cat}`);
    ScrollTrigger.refresh();
  };
  cats.forEach((b) => b.addEventListener("click", () => filter(b.dataset.cat)));
  filter(location.hash.slice(1) || "all", false);

  // Text·image switch: transitions are turned off at the moment of switching (original notransition), and hover indicators are cleared too
  const toggle = box.querySelector(".mr-toggle");
  const KEY = "mr-works-image";
  const setLayout = (image, save = true) => {
    index.classList.add("is-switching");
    index.classList.toggle("is-image", image);
    toggle.querySelectorAll("button").forEach((b) => b.classList.toggle("is-on", (b.dataset.layout === "image") === image));
    items.forEach((it) => it.classList.remove("is-hover"));
    if (save) localStorage.setItem(KEY, image ? "1" : "0");
    requestAnimationFrame(() => requestAnimationFrame(() => { index.classList.remove("is-switching"); toggle.classList.toggle("is-image", image); }));
    ScrollTrigger.refresh();
  };
  toggle.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => setLayout(b.dataset.layout === "image")));
  if (localStorage.getItem(KEY) === "1") setLayout(true, false);

  if (!touch) {
    ScrollTrigger.create({ trigger: toggle, start: "bottom+=100% bottom", endTrigger: index, end: "bottom bottom", pin: true, pinSpacing: false });
    groups.forEach((g) => {
      const head = g.querySelector(".mr-wgroup__head");
      ScrollTrigger.create({ trigger: head, start: "top top", endTrigger: g, end: () => `bottom-=${head.offsetHeight} top`, pin: true, pinSpacing: false });
    });
  } else {
    // Original: only the one row passing the screen center gets the hover look
    items.forEach((it) => ScrollTrigger.create({ trigger: it, start: "top center", end: "bottom center", onToggle: (st) => { if (st.isActive) items.forEach((o) => o.classList.toggle("is-hover", o === it)); else it.classList.remove("is-hover"); } }));
  }
});
